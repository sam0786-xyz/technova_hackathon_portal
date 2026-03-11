'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { auth } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

export interface BugReportSubmission {
    title: string
    description: string
    category: 'UI' | 'Performance' | 'Feature Request' | 'Bug' | 'Other'
    browserInfo?: {
        userAgent: string
        viewport: { width: number; height: number }
        url: string
    }
}

export interface BugReportResponse {
    success: boolean
    message: string
    xpAwarded?: number
    reportId?: string
}

/**
 * Submit a bug report and award XP
 */
export async function submitBugReport(data: BugReportSubmission): Promise<BugReportResponse> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: 'You must be logged in to submit a bug report' }
    }

    const supabase = createAdminClient()

    try {
        // Insert bug report
        const { data: report, error: reportError } = await supabase
            .from('bug_reports')
            .insert({
                user_id: session.user.id,
                title: data.title,
                description: data.description,
                category: data.category,
                browser_info: data.browserInfo || null,
                status: 'pending',
                priority: 'medium'
            })
            .select('id')
            .single()

        if (reportError) {
            console.error('Bug report submission error:', reportError)
            return { success: false, message: 'Failed to submit bug report' }
        }

        // Award XP: 10 for first report, 5 for additional, max 50 total
        const { count: previousReports } = await supabase
            .from('bug_reports')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .eq('xp_awarded', true)

        const totalPreviousReports = previousReports || 0

        // Calculate XP to award
        let xpToAward = 0
        if (totalPreviousReports === 0) {
            xpToAward = 10 // First report
        } else if (totalPreviousReports < 10) {
            xpToAward = 5 // Additional reports (up to 10 reports = 10 + 9*5 = 55, capped at 50)
        }

        // Check if we've hit the cap
        const totalXpFromReports = totalPreviousReports === 0 ? 0 : (10 + (totalPreviousReports - 1) * 5)
        if (totalXpFromReports >= 50) {
            xpToAward = 0 // Cap reached
        } else if (totalXpFromReports + xpToAward > 50) {
            xpToAward = 50 - totalXpFromReports // Award partial to reach cap
        }

        if (xpToAward > 0) {
            // Mark report as XP awarded
            await supabase
                .from('bug_reports')
                .update({ xp_awarded: true })
                .eq('id', report.id)

            // Award XP to user
            const { data: user } = await supabase
                .schema('next_auth')
                .from('users')
                .select('xp_points')
                .eq('id', session.user.id)
                .single()

            const currentXP = user?.xp_points || 0
            const newXP = currentXP + xpToAward

            await supabase
                .schema('next_auth')
                .from('users')
                .update({ xp_points: newXP })
                .eq('id', session.user.id)

            // Record in xp_awards (optional, for tracking)
            await supabase
                .from('xp_awards')
                .insert({
                    user_id: session.user.id,
                    event_id: null,
                    xp_amount: xpToAward,
                    source: 'bug_report'
                })

            // Revalidate leaderboard
            revalidateTag('leaderboard')
            revalidateTag(`user-${session.user.id}`)
        }

        return {
            success: true,
            message: xpToAward > 0
                ? `Bug report submitted! You earned ${xpToAward} XP.`
                : 'Bug report submitted! Thank you for helping improve the platform.',
            xpAwarded: xpToAward,
            reportId: report.id
        }

    } catch (error) {
        console.error('Bug report error:', error)
        return { success: false, message: 'An error occurred while submitting your report' }
    }
}

/**
 * Get all bug reports (admin only)
 */
export async function getAllBugReports() {
    const session = await auth()

    if (session?.user?.role !== 'super_admin') {
        return { success: false, data: [] }
    }

    const supabase = createAdminClient()

    const { data: reports, error } = await supabase
        .from('bug_reports')
        .select(`
            *,
            user:user_id (
                name,
                email
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching bug reports:', error)
        return { success: false, data: [] }
    }

    return { success: true, data: reports }
}
