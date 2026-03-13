'use server'

import { createClient as createServerClient } from "@supabase/supabase-js"
import { auth } from "@/lib/auth"
import { Resend } from "resend"
import { render } from "@react-email/render"
import ReminderEmail from "@/emails/reminder-email"
import BlastEmail from "@/emails/blast-email"
import { formatDate, formatTime } from "@/lib/utils"

// ==========================================
// Setup
// ==========================================

const resend = new Resend(process.env.RESEND_API_KEY)

function getSupabase() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://technovashardauniversity.in'

// ==========================================
// Types
// ==========================================

interface Participant {
    email: string
    name: string
}

interface EventWithParticipants {
    id: string
    title: string
    slug: string
    start_time: string
    venue: string
    participants: Participant[]
}

// ==========================================
// Helper Functions
// ==========================================

/**
 * Get all registered participants for an event with their emails
 */
async function getRegisteredParticipants(eventId: string): Promise<Participant[]> {
    const supabase = getSupabase()

    // Get registrations
    const { data: registrations, error } = await supabase
        .from('registrations')
        .select('user_id')
        .eq('event_id', eventId)

    if (error || !registrations || registrations.length === 0) {
        return []
    }

    const userIds = registrations.map(r => r.user_id)

    // Get user details
    const { data: users } = await supabase
        .schema('next_auth')
        .from('users')
        .select('id, email, name')
        .in('id', userIds)

    return (users || [])
        .filter(u => u.email) // Only users with emails
        .map(u => ({
            email: u.email!,
            name: u.name || 'Participant'
        }))
}

/**
 * Get events starting in approximately 3 hours that haven't sent reminders yet
 */
async function getEventsForReminder(): Promise<EventWithParticipants[]> {
    const supabase = getSupabase()

    // Calculate time window: events starting between 2.5 and 3.5 hours from now
    const now = new Date()
    const minTime = new Date(now.getTime() + 2.5 * 60 * 60 * 1000) // 2.5 hours from now
    const maxTime = new Date(now.getTime() + 3.5 * 60 * 60 * 1000) // 3.5 hours from now

    const { data: events, error } = await supabase
        .from('events')
        .select('id, title, slug, start_time, venue, reminder_sent_at')
        .gte('start_time', minTime.toISOString())
        .lte('start_time', maxTime.toISOString())
        .is('reminder_sent_at', null) // Only events that haven't had reminders sent
        .neq('status', 'cancelled')

    if (error || !events || events.length === 0) {
        return []
    }

    // Get participants for each event
    const eventsWithParticipants: EventWithParticipants[] = await Promise.all(
        events.map(async (event) => {
            const participants = await getRegisteredParticipants(event.id)
            return {
                ...event,
                participants
            }
        })
    )

    return eventsWithParticipants.filter(e => e.participants.length > 0)
}

// ==========================================
// Core Functions
// ==========================================

/**
 * Send reminder emails for events starting in ~3 hours
 * Called by cron job
 */
export async function sendEventReminders(): Promise<{ success: boolean; eventsSent: number; emailsSent: number }> {
    const supabase = getSupabase()
    const events = await getEventsForReminder()

    let totalEmailsSent = 0

    for (const event of events) {
        const eventUrl = `${BASE_URL}/events/${event.slug || event.id}`
        const eventDate = formatDate(event.start_time)
        const eventTime = formatTime(event.start_time)

        // Calculate hours until event
        const hoursUntilEvent = Math.round(
            (new Date(event.start_time).getTime() - Date.now()) / (1000 * 60 * 60)
        )

        // Send emails to all participants
        for (const participant of event.participants) {
            try {
                const emailHtml = await render(ReminderEmail({
                    eventName: event.title,
                    userName: participant.name,
                    eventDate,
                    eventTime,
                    venue: event.venue || 'TBA',
                    eventUrl,
                    hoursUntilEvent
                }))

                await resend.emails.send({
                    from: 'Technova <noreply@technovashardauniversity.in>',
                    to: participant.email,
                    subject: `⏰ Reminder: ${event.title} starts in ${hoursUntilEvent} hours!`,
                    html: emailHtml
                })

                totalEmailsSent++
            } catch (err) {
                console.error(`Failed to send reminder to ${participant.email}:`, err)
            }
        }

        // Mark event as having sent reminders
        await supabase
            .from('events')
            .update({ reminder_sent_at: new Date().toISOString() })
            .eq('id', event.id)
    }

    return {
        success: true,
        eventsSent: events.length,
        emailsSent: totalEmailsSent
    }
}

/**
 * Send a blast email to all registered participants for an event
 * Admin only
 */
export async function sendBlastEmail(
    eventId: string,
    subject: string,
    message: string
): Promise<{ success: boolean; emailsSent: number; error?: string }> {
    // Verify admin authorization
    const session = await auth()
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        return { success: false, emailsSent: 0, error: 'Unauthorized' }
    }

    const supabase = getSupabase()

    // Get event details
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, title, slug')
        .eq('id', eventId)
        .single()

    if (eventError || !event) {
        return { success: false, emailsSent: 0, error: 'Event not found' }
    }

    // Get participants
    const participants = await getRegisteredParticipants(eventId)

    if (participants.length === 0) {
        return { success: false, emailsSent: 0, error: 'No registered participants' }
    }

    const eventUrl = `${BASE_URL}/events/${event.slug || event.id}`
    let emailsSent = 0
    let emailsFailed = 0

    // Helper function to delay between sends (Resend free tier: 2 req/sec)
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    // Send emails with rate limiting
    for (let i = 0; i < participants.length; i++) {
        const participant = participants[i]

        // Add delay between emails to respect rate limit (600ms = ~1.6 req/sec, staying safely under 2/sec)
        if (i > 0) {
            await delay(600)
        }

        let retries = 2
        while (retries > 0) {
            try {
                const emailHtml = await render(BlastEmail({
                    eventName: event.title,
                    userName: participant.name,
                    subject,
                    message,
                    eventUrl
                }))

                await resend.emails.send({
                    from: 'Technova <noreply@technovashardauniversity.in>',
                    to: participant.email,
                    subject: `📢 ${subject} - ${event.title}`,
                    html: emailHtml
                })

                emailsSent++
                console.log(`[Blast] Sent ${emailsSent}/${participants.length} to ${participant.email}`)
                break // Success, exit retry loop
            } catch (err: any) {
                retries--
                if (err?.statusCode === 429 && retries > 0) {
                    // Rate limited - wait longer and retry
                    console.log(`[Blast] Rate limited, waiting 2s before retry...`)
                    await delay(2000)
                } else {
                    console.error(`[Blast] Failed to send to ${participant.email}:`, err?.message || err)
                    emailsFailed++
                    break
                }
            }
        }
    }

    console.log(`[Blast] Complete: ${emailsSent} sent, ${emailsFailed} failed`)

    // Log the blast email (ignore if table doesn't exist)
    try {
        await supabase.from('email_logs').insert({
            event_id: eventId,
            type: 'blast',
            subject,
            message,
            recipients_count: emailsSent,
            sent_by: session.user.id,
            sent_at: new Date().toISOString()
        })
    } catch {
        // Ignore - email_logs table may not exist
    }

    return { success: true, emailsSent }
}

/**
 * Get blast email history for an event
 */
export async function getBlastHistory(eventId: string) {
    const session = await auth()
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        return []
    }

    const supabase = getSupabase()

    const { data } = await supabase
        .from('email_logs')
        .select('*')
        .eq('event_id', eventId)
        .eq('type', 'blast')
        .order('sent_at', { ascending: false })
        .limit(10)

    return data || []
}
