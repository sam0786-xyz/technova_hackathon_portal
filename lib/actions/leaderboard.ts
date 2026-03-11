'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

export type LeaderboardUser = {
    id: string
    name: string
    email: string
    image?: string | null
    xp_points: number
    system_id?: string
    role?: string
}

export interface LeaderboardResponse {
    users: LeaderboardUser[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
    timeFilter: TimeFilter
}

export type TimeFilter = 'all-time' | 'weekly' | 'monthly' | 'yearly'

/**
 * Get date range based on time filter
 */
function getDateRange(filter: TimeFilter): { startDate: string | null } {
    const now = new Date()

    switch (filter) {
        case 'weekly': {
            const weekAgo = new Date(now)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return { startDate: weekAgo.toISOString() }
        }
        case 'monthly': {
            const monthAgo = new Date(now)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return { startDate: monthAgo.toISOString() }
        }
        case 'yearly': {
            const startOfYear = new Date(now.getFullYear(), 0, 1)
            return { startDate: startOfYear.toISOString() }
        }
        case 'all-time':
        default:
            return { startDate: null }
    }
}

/**
 * Internal function to fetch leaderboard data from database
 * For time-filtered views, aggregates XP from xp_awards table
 */
async function fetchLeaderboardFromDB(
    page: number,
    pageSize: number,
    search?: string,
    timeFilter: TimeFilter = 'all-time'
): Promise<LeaderboardResponse> {
    const supabase = createAdminClient()
    const offset = (page - 1) * pageSize

    // For all-time, use the optimized direct query on users table
    if (timeFilter === 'all-time') {
        let query = supabase
            .schema('next_auth')
            .from('users')
            .select('id, name, email, image, xp_points, role', { count: 'exact' })
            .order('xp_points', { ascending: false })

        if (search && search.trim()) {
            const searchTerm = `%${search.trim()}%`
            query = query.or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`)
        }

        query = query.range(offset, offset + pageSize - 1)

        const { data: users, error, count } = await query

        if (error) {
            console.error('Error fetching leaderboard:', error)
            return { users: [], totalCount: 0, page, pageSize, totalPages: 0, timeFilter }
        }

        return {
            users: users as LeaderboardUser[],
            totalCount: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize),
            timeFilter
        }
    }

    // For time-filtered views, aggregate from xp_awards table
    const { startDate } = getDateRange(timeFilter)

    // Get aggregated XP from xp_awards within date range
    const { data: awards, error: awardsError } = await supabase
        .from('xp_awards')
        .select('user_id, xp_amount')
        .gte('awarded_at', startDate!)

    if (awardsError) {
        console.error('Error fetching XP awards:', awardsError)
        return { users: [], totalCount: 0, page, pageSize, totalPages: 0, timeFilter }
    }

    // Get aggregated XP from referrals within date range
    const { data: referralAwards, error: referralError } = await supabase
        .from('referrals')
        .select('referrer_id, xp_awarded')
        .gte('created_at', startDate!)

    if (referralError) {
        console.error('Error fetching referral awards:', referralError)
        // We continue even if referrals fail, just logging it
    }

    // Aggregate XP by user
    const userXpMap = new Map<string, number>()

    // Add Attendance XP
    awards?.forEach(award => {
        const current = userXpMap.get(award.user_id) || 0
        userXpMap.set(award.user_id, current + award.xp_amount)
    })

    // Add Referral XP
    referralAwards?.forEach(ref => {
        if (ref.referrer_id && ref.xp_awarded) {
            const current = userXpMap.get(ref.referrer_id) || 0
            userXpMap.set(ref.referrer_id, current + ref.xp_awarded)
        }
    })

    // Get user details for users with XP in this period
    const userIds = Array.from(userXpMap.keys())

    if (userIds.length === 0) {
        return { users: [], totalCount: 0, page, pageSize, totalPages: 0, timeFilter }
    }

    let usersQuery = supabase
        .schema('next_auth')
        .from('users')
        .select('id, name, email, image, role')
        .in('id', userIds)

    if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`
        usersQuery = usersQuery.or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`)
    }

    const { data: users, error: usersError } = await usersQuery

    if (usersError || !users) {
        console.error('Error fetching users:', usersError)
        return { users: [], totalCount: 0, page, pageSize, totalPages: 0, timeFilter }
    }

    // Combine user data with aggregated XP and sort
    const rankedUsers: LeaderboardUser[] = users
        .map(user => ({
            ...user,
            xp_points: userXpMap.get(user.id) || 0
        }))
        .sort((a, b) => b.xp_points - a.xp_points)

    // Apply pagination
    const paginatedUsers = rankedUsers.slice(offset, offset + pageSize)
    const totalCount = rankedUsers.length

    return {
        users: paginatedUsers,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        timeFilter
    }
}

/**
 * Get paginated leaderboard data with optional search and time filter
 * Cached for 60 seconds to reduce database hits
 */
export async function getLeaderboardData(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    timeFilter: TimeFilter = 'all-time'
): Promise<LeaderboardResponse> {
    const cacheKey = `leaderboard-${page}-${pageSize}-${search || 'all'}-${timeFilter}`

    const getCachedData = unstable_cache(
        async () => fetchLeaderboardFromDB(page, pageSize, search, timeFilter),
        [cacheKey],
        {
            revalidate: 60,
            tags: ['leaderboard']
        }
    )

    return getCachedData()
}

/**
 * Internal function to fetch top 3 users from database
 */
async function fetchTopThreeFromDB(timeFilter: TimeFilter = 'all-time'): Promise<LeaderboardUser[]> {
    const supabase = createAdminClient()

    if (timeFilter === 'all-time') {
        const { data: users, error } = await supabase
            .schema('next_auth')
            .from('users')
            .select('id, name, email, image, xp_points, role')
            .order('xp_points', { ascending: false })
            .limit(3)

        if (error) {
            console.error('Error fetching top 3:', error)
            return []
        }
        return users as LeaderboardUser[]
    }

    // For time-filtered, aggregate and get top 3
    const { startDate } = getDateRange(timeFilter)

    const { data: awards, error } = await supabase
        .from('xp_awards')
        .select('user_id, xp_amount')
        .gte('awarded_at', startDate!)

    if (error) {
        console.error('Error fetching top 3 awards:', error)
        return []
    }

    // Get aggregated XP from referrals within date range
    const { data: referralAwards, error: referralError } = await supabase
        .from('referrals')
        .select('referrer_id, xp_awarded')
        .gte('created_at', startDate!)

    if (referralError) {
        console.error('Error fetching referral awards for top 3:', referralError)
    }

    // Aggregate and get top 3 user IDs
    const userXpMap = new Map<string, number>()

    // Add Attendance XP
    awards?.forEach(award => {
        const current = userXpMap.get(award.user_id) || 0
        userXpMap.set(award.user_id, current + award.xp_amount)
    })

    // Add Referral XP
    referralAwards?.forEach(ref => {
        if (ref.referrer_id && ref.xp_awarded) {
            const current = userXpMap.get(ref.referrer_id) || 0
            userXpMap.set(ref.referrer_id, current + ref.xp_awarded)
        }
    })

    const sortedUsers = Array.from(userXpMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)

    if (sortedUsers.length === 0) return []

    const userIds = sortedUsers.map(u => u[0])

    const { data: users } = await supabase
        .schema('next_auth')
        .from('users')
        .select('id, name, email, image, role')
        .in('id', userIds)

    if (!users) return []

    // Combine with XP and sort
    return users
        .map(user => ({
            ...user,
            xp_points: userXpMap.get(user.id) || 0
        }))
        .sort((a, b) => b.xp_points - a.xp_points) as LeaderboardUser[]
}

/**
 * Get top 3 users for podium display
 * Cached for 60 seconds
 */
export async function getTopThreeUsers(timeFilter: TimeFilter = 'all-time'): Promise<LeaderboardUser[]> {
    const getCachedTopThree = unstable_cache(
        () => fetchTopThreeFromDB(timeFilter),
        [`leaderboard-top-three-${timeFilter}`],
        {
            revalidate: 60,
            tags: ['leaderboard']
        }
    )

    return getCachedTopThree()
}

// ==========================================
// User Rank Lookup
// ==========================================

export interface UserRankInfo {
    rank: number
    xp_points: number
    totalUsers: number
    percentile: number
    isTopTen: boolean
    eventsAttended: number
}

/**
 * Get a specific user's rank efficiently (all-time only)
 */
async function fetchUserRankFromDB(userId: string): Promise<UserRankInfo | null> {
    const supabase = createAdminClient()

    const { data: user, error: userError } = await supabase
        .schema('next_auth')
        .from('users')
        .select('xp_points')
        .eq('id', userId)
        .single()

    if (userError || !user) {
        console.error('Error fetching user XP:', userError)
        return null
    }

    const { count: higherCount, error: countError } = await supabase
        .schema('next_auth')
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gt('xp_points', user.xp_points)

    if (countError) {
        console.error('Error counting higher ranked users:', countError)
        return null
    }

    const { count: totalCount, error: totalError } = await supabase
        .schema('next_auth')
        .from('users')
        .select('*', { count: 'exact', head: true })

    if (totalError) {
        console.error('Error counting total users:', totalError)
        return null
    }

    const rank = (higherCount || 0) + 1
    const totalUsers = totalCount || 1
    const percentile = Math.round(((totalUsers - rank) / totalUsers) * 100)

    // Get events attended count from registrations table
    const { count: eventsCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('attended', true)

    return {
        rank,
        xp_points: user.xp_points,
        totalUsers,
        percentile,
        isTopTen: rank <= 10,
        eventsAttended: eventsCount || 0
    }
}

/**
 * Get user rank with caching (60s)
 */
export async function getUserRank(userId: string): Promise<UserRankInfo | null> {
    const getCachedRank = unstable_cache(
        () => fetchUserRankFromDB(userId),
        [`user-rank-${userId}`],
        {
            revalidate: 60,
            tags: ['leaderboard', `user-${userId}`]
        }
    )

    return getCachedRank()
}
