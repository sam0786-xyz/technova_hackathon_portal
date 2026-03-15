import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    // Security: Verify only admins can mark attendance
    const session = await auth()
    if (!session || !session.user || !['admin', 'super_admin'].includes(session.user.role)) {
        return NextResponse.json({ success: false, message: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    // Rate limiting: 30 scans per minute per user
    const rateLimit = checkRateLimit(
        getClientIdentifier(req, session.user.id),
        { limit: 30, windowSeconds: 60 }
    )
    if (!rateLimit.success) {
        return NextResponse.json({
            success: false,
            message: 'Too many requests. Please slow down.'
        }, { status: 429 })
    }

    try {
        const body = await req.json()

        // Handle both legacy (long keys) and new (short keys) formats
        const token = body.token || body.t
        const userId = body.userId || body.u
        const eventId = body.eventId || body.e

        if (!token || !userId || !eventId) {
            return NextResponse.json({ success: false, message: 'Invalid QR data' }, { status: 400 })
        }

        // 1. Find Registration by token
        const { data: registration, error: regError } = await supabase
            .from('registrations')
            .select('*, events(*)')
            .eq('qr_token_id', token)
            .eq('user_id', userId)
            .eq('event_id', eventId)
            .single()

        if (regError || !registration) {
            return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 })
        }

        // 2. Determine if this is a multi-day event
        const eventStart = registration.events?.start_time ? new Date(registration.events.start_time) : null
        const eventEnd = registration.events?.end_time ? new Date(registration.events.end_time) : null
        const isMultiDay = registration.events?.is_multi_day ||
            (eventStart && eventEnd && eventStart.toDateString() !== eventEnd.toDateString())

        // 3. For single-day events: block if already attended
        // For multi-day events: allow re-scans (awardDailyXP handles per-day deduplication)
        if (!isMultiDay && registration.attended) {
            const { data: existingUser } = await supabase
                .schema('next_auth' as unknown as 'public')
                .from('users')
                .select('name')
                .eq('id', userId)
                .single()

            return NextResponse.json({
                success: false,
                message: 'Already checked in',
                userName: existingUser?.name || 'Attendee'
            }, { status: 400 })
        }



        // 5. Handle Attendance Marking
        // For single-day events, check if already attended
        if (!isMultiDay && registration.attended) {
            const { data: existingUser } = await supabase
                .schema('next_auth' as unknown as 'public')
                .from('users')
                .select('name')
                .eq('id', userId)
                .single()

            return NextResponse.json({
                success: false,
                message: 'Already checked in',
                userName: existingUser?.name || 'Attendee'
            }, { status: 400 })
        }

        // For multi-day events, simple tracking by marking attended=true
        // Advanced day-by-day tracking required a dedicated table which was removed with XP
        if (!registration.attended) {
            const { error: updateError } = await supabase
                .from('registrations')
                .update({ attended: true })
                .eq('id', registration.id)

            if (updateError) {
                console.error('Attendance update error:', updateError)
                return NextResponse.json({ success: false, message: 'Failed to mark attendance' }, { status: 500 })
            }
        }

        // 6. Mark as attended (first time only)
        if (!registration.attended) {
            const { error: updateError } = await supabase
                .from('registrations')
                .update({ attended: true })
                .eq('id', registration.id)

            if (updateError) {
                console.error('Attendance update error:', updateError)
                // Continue even if update fails - XP was awarded
            }
        }

        // 7. Get User Name from next_auth schema
        const { data: user } = await supabase
            .schema('next_auth' as unknown as 'public')
            .from('users')
            .select('name')
            .eq('id', userId)
            .single()

        return NextResponse.json({
            success: true,
            message: 'Check-in successful',
            userName: user?.name || 'Attendee'
        })

    } catch (err) {
        console.error('Scan Error:', err)
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
    }
}
