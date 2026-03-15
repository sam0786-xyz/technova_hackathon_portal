'use server'

import { createClient as createServerClient } from "@supabase/supabase-js"
import { auth } from "@/lib/auth"
import { createOrder } from "@/lib/payments/razorpay"
import { revalidatePath } from "next/cache"
import { generateQRToken } from "@/lib/qr/generate"
import { Resend } from "resend"
import { render } from "@react-email/render"
import { TicketEmail } from "@/emails/ticket-email"

const resend = new Resend(process.env.RESEND_API_KEY)

async function getSupabase() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function checkRegistration(eventId: string) {
    const session = await auth()
    if (!session) return null

    const supabase = await getSupabase()
    const { data } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('event_id', eventId)
        .maybeSingle()

    return data
}

export async function registerForEvent(eventId: string, answers?: Record<string, any>) {
    console.log('=== REGISTER FOR EVENT ===')
    console.log('Event ID:', eventId)

    const session = await auth()
    if (!session) throw new Error("Unauthorized")

    console.log('User ID:', session.user.id)

    const supabase = await getSupabase()

    // 1. Fetch Event Details
    const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single()
    if (!event) throw new Error("Event not found")

    // 2. Check Capacity
    const { count } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('event_id', eventId)
    if ((count || 0) >= event.capacity) {
        throw new Error("Event Full")
    }

    // 3. Check Existing
    const existing = await checkRegistration(eventId)
    if (existing) throw new Error("Already Registered")

    // 4. Handle Payment Logic
    if (event.price > 0) {
        const order = await createOrder(event.price)
        await supabase.from('registrations').insert({
            user_id: session.user.id,
            event_id: eventId,
            payment_status: 'pending',
            qr_token_id: order.id,
            answers: answers || {}
        })
        return { status: 'payment_required', order }
    } else {
        // Free Event - Generate QR (for in-person events only) and Register
        // Fetch full user details for QR
        const { data: userProfile } = await supabase.schema('next_auth').from('users').select('*').eq('id', session.user.id).single()

        const userData = {
            name: userProfile?.name || session.user.name || '',
            system_id: userProfile?.system_id || '',
            year: userProfile?.year?.toString() || '',
            course: userProfile?.course || '',
            section: userProfile?.section || '',
            email: session.user.email || ''
        }

        // Only generate QR token for in-person events
        let token = null
        if (!event.is_virtual) {
            const qrResult = await generateQRToken(session.user.id!, eventId, userData)
            token = qrResult.token
        }

        const { error } = await supabase.from('registrations').insert({
            user_id: session.user.id,
            event_id: eventId,
            payment_status: 'free',
            qr_token_id: token,
            answers: answers || {}
        })

        if (error) throw new Error(error.message)

        console.log('Registration successful!')

        // Send Email - with QR only for in-person events
        try {
            if (!event.is_virtual && token) {
                // Generate QR for email attachment (in-person events)
                const { qrDataUrl } = await generateQRToken(session.user.id!, eventId, userData, token)
                const qrBase64 = qrDataUrl.split(',')[1]
                const qrBuffer = Buffer.from(qrBase64, 'base64')

                const emailHtml = await render(TicketEmail({
                    eventName: event.title,
                    userName: session.user.name || 'Student',
                    eventDate: new Date(event.start_time).toLocaleString(),
                    venue: event.venue,
                    qrDataUrl: 'cid:qrcode', // Use CID reference for inline attachment
                    ticketId: token
                }))

                const { data, error: emailError } = await resend.emails.send({
                    from: 'Technova <noreply@technovashardauniversity.in>',
                    to: session.user.email!,
                    subject: `🎫 Your Ticket for ${event.title}`,
                    html: emailHtml,
                    attachments: [
                        {
                            filename: 'qr-code.png',
                            content: qrBuffer,
                            contentType: 'image/png',
                            contentId: 'qrcode'
                        }
                    ]
                })

                if (emailError) {
                    console.error("Resend API Error:", emailError)
                }
            } else {
                // Virtual event - skip QR email
            }
        } catch (emailError) {
            console.error("Failed to send email:", emailError)
            // Don't block registration on email failure
        }

        revalidatePath(`/events/${eventId}`)
        return { status: 'success', isVirtual: event.is_virtual }
    }
}

export async function getMyRegistration(eventId: string) {
    const session = await auth()
    if (!session) return null

    const supabase = await getSupabase()
    const { data } = await supabase
        .from('registrations')
        .select('*, events(*)')
        .eq('user_id', session.user.id)
        .eq('event_id', eventId)
        .maybeSingle()

    return data
}

export async function getEventRegistrations(eventId: string) {
    const session = await auth()
    if (!session || !session.user || !['admin', 'super_admin'].includes(session.user.role)) {
        throw new Error("Unauthorized")
    }

    const supabase = await getSupabase()

    // 1. Get Registrations
    const { data: registrations, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId)

    if (error) throw new Error(error.message)
    if (!registrations.length) return []

    // 2. Get User IDs
    const userIds = registrations.map(r => r.user_id)

    // 3. Get User Details
    const { data: users, error: userError } = await supabase
        .schema('next_auth')
        .from('users')
        .select('id, name, email, system_id, year, course, section')
        .in('id', userIds)

    if (userError) throw new Error(userError.message)

    // 4. Merge Data
    const combined = registrations.map(reg => {
        const user = users?.find(u => u.id === reg.user_id)
        return {
            ...reg,
            user: user || { name: 'Unknown', email: 'Unknown' }
        }
    })

    return combined
}

export async function getAllRegistrations() {
    const session = await auth()
    if (!session || !session.user || !['admin', 'super_admin'].includes(session.user.role)) {
        throw new Error("Unauthorized")
    }

    const supabase = await getSupabase()

    // 1. Get All Registrations with Event details
    const { data: registrations, error } = await supabase
        .from('registrations')
        .select('*, events(*)')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    if (!registrations || registrations.length === 0) return []

    // 2. Get User IDs
    const userIds = Array.from(new Set(registrations.map(r => r.user_id)))

    // 3. Get User Details
    const { data: users, error: userError } = await supabase
        .schema('next_auth')
        .from('users')
        .select('id, name, email, system_id, year, course, section')
        .in('id', userIds)

    if (userError) throw new Error(userError.message)

    // 4. Merge Data
    const combined = registrations.map(reg => {
        const user = users?.find(u => u.id === reg.user_id)
        return {
            ...reg,
            user: user || { name: 'Unknown', email: 'Unknown' }
        }
    })

    return combined
}
export async function cancelRegistration(registrationId: string) {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")

    const supabase = await getSupabase()

    // Authorization check
    // 1. If admin, can cancel any.
    // 2. If student, can only cancel own.

    let query = supabase.from('registrations').delete().eq('id', registrationId)

    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
        // Enforce user ownership
        query = query.eq('user_id', session.user.id)
    }

    const { error } = await query

    if (error) {
        console.error("Cancel Error:", error)
        throw new Error("Failed to cancel registration")
    }

    revalidatePath("/events")
    revalidatePath("/admin/events")
}
