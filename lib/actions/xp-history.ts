'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

export interface XPHistoryPoint {
    date: string
    xp: number
    cumulativeXp: number
    eventTitle?: string
}

export interface XPHistoryResponse {
    history: XPHistoryPoint[]
    totalXp: number
    eventCount: number
}

/**
 * Fetch XP history for a user (last 30 days by default)
 */
async function fetchXPHistoryFromDB(
    userId: string,
    days: number = 30
): Promise<XPHistoryResponse> {
    const supabase = createAdminClient()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get XP awards with event info, ordered by date
    const { data: awards, error } = await supabase
        .from('xp_awards')
        .select(`
            xp_amount,
            awarded_at,
            events (title)
        `)
        .eq('user_id', userId)
        .gte('awarded_at', startDate.toISOString())
        .order('awarded_at', { ascending: true })

    if (error) {
        console.error('Error fetching XP history:', error)
        return { history: [], totalXp: 0, eventCount: 0 }
    }

    if (!awards || awards.length === 0) {
        return { history: [], totalXp: 0, eventCount: 0 }
    }

    // Group by date and calculate cumulative XP
    const dateMap = new Map<string, { xp: number; events: string[] }>()

    awards.forEach(award => {
        const date = new Date(award.awarded_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        })

        const existing = dateMap.get(date) || { xp: 0, events: [] }
        existing.xp += award.xp_amount
        if (award.events && typeof award.events === 'object' && 'title' in award.events) {
            existing.events.push(award.events.title as string)
        }
        dateMap.set(date, existing)
    })

    // Convert to history points with cumulative XP
    let cumulativeXp = 0
    const history: XPHistoryPoint[] = []

    dateMap.forEach((value, date) => {
        cumulativeXp += value.xp
        history.push({
            date,
            xp: value.xp,
            cumulativeXp,
            eventTitle: value.events.join(', ')
        })
    })

    const totalXp = awards.reduce((sum, a) => sum + a.xp_amount, 0)

    return {
        history,
        totalXp,
        eventCount: awards.length
    }
}

/**
 * Get user's XP history with caching
 */
export async function getXPHistory(
    userId: string,
    days: number = 30
): Promise<XPHistoryResponse> {
    const getCachedHistory = unstable_cache(
        () => fetchXPHistoryFromDB(userId, days),
        [`xp-history-${userId}-${days}`],
        {
            revalidate: 60,
            tags: ['xp-history', `user-${userId}`]
        }
    )

    return getCachedHistory()
}
