/**
 * XP Module - Feedback Awards
 * Awards XP for feedback submissions
 */

import { createClient } from '@supabase/supabase-js'
import { FEEDBACK_XP_REWARD } from '@/lib/constants/feedback'

// ==========================================
// Types
// ==========================================

export interface FeedbackXPResult {
    success: boolean
    xpAwarded: number
    message: string
}

// ==========================================
// Helper - Get Supabase client
// ==========================================

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// ==========================================
// Award XP for feedback submission
// ==========================================

/**
 * Award XP for submitting feedback
 * Uses feedback_responses table to track if XP was awarded (xp_awarded column)
 * and directly updates user's XP points
 */
export async function awardXPForFeedback(
    userId: string,
    formId: string,
    eventId: string
): Promise<FeedbackXPResult> {
    const supabase = getSupabase()

    // Check if XP already awarded for this feedback form
    // Using the feedback_responses table's xp_awarded column
    const { data: response } = await supabase
        .from('feedback_responses')
        .select('id, xp_awarded')
        .eq('form_id', formId)
        .eq('user_id', userId)
        .single()

    if (!response) {
        return {
            success: false,
            xpAwarded: 0,
            message: 'No feedback submission found'
        }
    }

    if (response.xp_awarded) {
        return {
            success: false,
            xpAwarded: 0,
            message: 'XP already awarded for this feedback'
        }
    }

    // Update user's total XP points directly
    const { data: user } = await supabase
        .schema('next_auth' as unknown as 'public')
        .from('users')
        .select('xp_points')
        .eq('id', userId)
        .single()

    const currentXP = user?.xp_points || 0
    const newXP = currentXP + FEEDBACK_XP_REWARD

    const { error: updateError } = await supabase
        .schema('next_auth' as unknown as 'public')
        .from('users')
        .update({ xp_points: newXP })
        .eq('id', userId)

    if (updateError) {
        console.error('Feedback XP Update Error:', updateError)
        return {
            success: false,
            xpAwarded: 0,
            message: 'Failed to update XP'
        }
    }

    // CRITICAL: Record this in xp_awards history so it shows up on profile
    // Supabase returns errors in response, not by throwing
    const { error: xpInsertError } = await supabase.from('xp_awards').insert({
        user_id: userId,
        event_id: eventId,
        xp_amount: FEEDBACK_XP_REWARD,
        source: 'feedback',
        description: 'Completed Feedback Form'
    })

    if (xpInsertError) {
        console.error('[XP Awards] Insert Error:', xpInsertError.message, xpInsertError.code)
        // Try simpler insert without optional columns (source, description)
        const { error: simpleInsertError } = await supabase.from('xp_awards').insert({
            user_id: userId,
            event_id: eventId,
            xp_amount: FEEDBACK_XP_REWARD
        })
        if (simpleInsertError) {
            console.error('[XP Awards] Simple Insert also failed:', simpleInsertError.message)
        } else {
            console.log('[XP Awards] Simple insert succeeded (without source/description)')
        }
    } else {
        console.log(`[XP Awards] Recorded ${FEEDBACK_XP_REWARD} XP for user ${userId}`)
    }

    // Mark XP as awarded in the response
    const { error: markError } = await supabase
        .from('feedback_responses')
        .update({ xp_awarded: true })
        .eq('id', response.id)

    if (markError) {
        console.error('[Feedback] Failed to mark xp_awarded:', markError.message)
    }

    return {
        success: true,
        xpAwarded: FEEDBACK_XP_REWARD,
        message: `Earned +${FEEDBACK_XP_REWARD} XP for feedback!`
    }
}

/**
 * Check if user has been awarded XP for feedback on a form
 */
export async function hasFeedbackXPBeenAwarded(
    userId: string,
    formId: string
): Promise<boolean> {
    const supabase = getSupabase()

    const { data } = await supabase
        .from('feedback_responses')
        .select('xp_awarded')
        .eq('form_id', formId)
        .eq('user_id', userId)
        .single()

    return data?.xp_awarded || false
}
