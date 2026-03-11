'use server'

import { createClient as createServerClient } from "@supabase/supabase-js"

const REFERRAL_XP_REWARD = 10

async function getSupabase() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

/**
 * Process all missed referrals from the registrations table
 * This finds registrations with referred_by set but no matching entry in referrals table
 * and creates the referral records + awards XP
 */
export async function processMissedReferrals(): Promise<{
    processed: number
    errors: string[]
    details: Array<{ registrationId: string; referrerId: string; status: string }>
}> {
    const supabase = await getSupabase()
    const errors: string[] = []
    const details: Array<{ registrationId: string; referrerId: string; status: string }> = []

    // 1. Get all registrations with a referred_by value
    const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('id, user_id, event_id, referred_by')
        .not('referred_by', 'is', null)

    if (regError) {
        return { processed: 0, errors: [`Failed to fetch registrations: ${regError.message}`], details: [] }
    }

    if (!registrations || registrations.length === 0) {
        return { processed: 0, errors: [], details: [] }
    }

    console.log(`Found ${registrations.length} registrations with referral codes`)

    let processed = 0

    for (const reg of registrations) {
        const referralCode = reg.referred_by
        const refereeId = reg.user_id
        const eventId = reg.event_id

        // Extract user ID prefix from referral code (first 8 chars before the dash)
        const userIdPrefix = referralCode.split('-')[0]
        if (!userIdPrefix || userIdPrefix.length !== 8) {
            errors.push(`Invalid referral code format: ${referralCode}`)
            details.push({ registrationId: reg.id, referrerId: 'unknown', status: 'invalid_code' })
            continue
        }

        console.log(`Looking for user with ID starting with: ${userIdPrefix}`)

        // Find the referrer - get all users and filter by prefix
        let referrerId: string = ''

        // First, get all users and filter (more reliable across schemas)
        const { data: allUsers, error: usersError } = await supabase
            .schema('next_auth' as any)
            .from('users')
            .select('id')

        if (usersError) {
            console.error('Error fetching users:', usersError)
            errors.push(`Error fetching users: ${usersError.message}`)
            details.push({ registrationId: reg.id, referrerId: 'error', status: 'db_error' })
            continue
        }

        // Find user whose ID starts with the prefix
        const matchingUser = allUsers?.find(u => u.id.toLowerCase().startsWith(userIdPrefix.toLowerCase()))

        if (!matchingUser) {
            console.log(`No user found with ID prefix: ${userIdPrefix}`)
            console.log('Available user IDs:', allUsers?.map(u => u.id.substring(0, 10)).join(', '))
            errors.push(`Referrer not found for code: ${referralCode}`)
            details.push({ registrationId: reg.id, referrerId: 'not_found', status: 'referrer_not_found' })
            continue
        }

        referrerId = matchingUser.id
        console.log(`Found referrer: ${referrerId}`)

        // Skip self-referrals
        if (referrerId === refereeId) {
            details.push({ registrationId: reg.id, referrerId, status: 'self_referral' })
            continue
        }

        // Check if referral already exists
        const { data: existingReferral } = await supabase
            .from('referrals')
            .select('id')
            .eq('referrer_id', referrerId)
            .eq('referee_id', refereeId)
            .eq('event_id', eventId)
            .maybeSingle()

        if (existingReferral) {
            details.push({ registrationId: reg.id, referrerId, status: 'already_processed' })
            continue
        }

        // Insert the referral record
        const { error: insertError } = await supabase
            .from('referrals')
            .insert({
                referrer_id: referrerId,
                referee_id: refereeId,
                event_id: eventId,
                referral_code: referralCode,
                xp_awarded: REFERRAL_XP_REWARD
            })

        if (insertError) {
            errors.push(`Failed to insert referral for ${reg.id}: ${insertError.message}`)
            details.push({ registrationId: reg.id, referrerId, status: `insert_error: ${insertError.message}` })
            continue
        }

        // Award XP to the referrer
        const { data: referrer } = await supabase
            .schema('next_auth' as any)
            .from('users')
            .select('xp_points')
            .eq('id', referrerId)
            .single()

        const currentXP = referrer?.xp_points || 0
        const newXP = currentXP + REFERRAL_XP_REWARD

        const { error: updateError } = await supabase
            .schema('next_auth' as any)
            .from('users')
            .update({ xp_points: newXP })
            .eq('id', referrerId)

        if (updateError) {
            errors.push(`Failed to update XP for ${referrerId}: ${updateError.message}`)
            details.push({ registrationId: reg.id, referrerId, status: `xp_update_error: ${updateError.message}` })
            continue
        }

        processed++
        details.push({ registrationId: reg.id, referrerId, status: 'success' })
        console.log(`Processed referral: ${referralCode} -> ${referrerId} (+${REFERRAL_XP_REWARD} XP)`)
    }

    return { processed, errors, details }
}
