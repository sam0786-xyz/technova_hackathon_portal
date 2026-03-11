'use server'

import { revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'

/**
 * Force revalidate all leaderboard caches
 * Use this after manual database updates
 */
export async function forceRevalidateLeaderboard() {
    const session = await getServerSession()

    // Only allow admins to force revalidation
    if (session?.user?.role !== 'super_admin' && session?.user?.role !== 'admin') {
        return { success: false, message: 'Unauthorized' }
    }

    try {
        // Revalidate leaderboard cache
        revalidateTag('leaderboard')

        // Revalidate all user rank caches
        const supabase = createAdminClient()
        const { data: users } = await supabase
            .schema('next_auth')
            .from('users')
            .select('id')

        if (users) {
            users.forEach(user => {
                revalidateTag(`user-${user.id}`)
            })
        }

        return {
            success: true,
            message: 'Leaderboard cache cleared successfully',
            usersRevalidated: users?.length || 0
        }
    } catch (error) {
        console.error('Cache revalidation error:', error)
        return { success: false, message: 'Failed to clear cache' }
    }
}
