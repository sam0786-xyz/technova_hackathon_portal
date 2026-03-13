'use server'

import { createClient as createServerClient } from "@supabase/supabase-js"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import type { CertificateTemplate, Certificate, CertificateType, QRRegion, TextRegion, SignatureRegion } from "@/types/custom"
import { Resend } from 'resend'
import { render } from '@react-email/render'
import CertificateNotificationEmail from "@/emails/certificate-notification"
import { formatDateShort } from "@/lib/utils"

const resend = new Resend(process.env.RESEND_API_KEY)

// Helper to get authenticated client
async function getSupabase() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// ==========================================
// Template Management (Admin)
// ==========================================

export async function createCertificateTemplate(
    eventId: string,
    templateUrl: string,
    qrRegion: QRRegion,
    textRegions: TextRegion[]
) {
    const session = await auth()
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        throw new Error("Unauthorized")
    }

    const supabase = await getSupabase()

    // Check if template already exists for this event
    const { data: existing } = await supabase
        .from('certificate_templates')
        .select('id')
        .eq('event_id', eventId)
        .single()

    if (existing) {
        // Update existing template
        const { data, error } = await supabase
            .from('certificate_templates')
            .update({
                template_url: templateUrl,
                qr_region: qrRegion,
                text_regions: textRegions,
                updated_at: new Date().toISOString()
            })
            .eq('event_id', eventId)
            .select()
            .single()

        if (error) {
            console.error("Update Template Error:", error)
            throw new Error("Failed to update certificate template")
        }

        revalidatePath(`/admin/events/${eventId}`)
        return { success: true, template: data, updated: true }
    }

    // Create new template
    const { data, error } = await supabase
        .from('certificate_templates')
        .insert({
            event_id: eventId,
            template_url: templateUrl,
            qr_region: qrRegion,
            text_regions: textRegions
        })
        .select()
        .single()

    if (error) {
        console.error("Create Template Error:", error)
        throw new Error("Failed to create certificate template")
    }

    revalidatePath(`/admin/events/${eventId}`)
    return { success: true, template: data, updated: false }
}

export async function updateCertificateTemplate(
    templateId: string,
    qrRegion: QRRegion,
    textRegions: TextRegion[]
) {
    const session = await auth()
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        throw new Error("Unauthorized")
    }

    const supabase = await getSupabase()

    const { data, error } = await supabase
        .from('certificate_templates')
        .update({
            qr_region: qrRegion,
            text_regions: textRegions,
            updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()
        .single()

    if (error) {
        console.error("Update Template Error:", error)
        throw new Error("Failed to update certificate template")
    }

    revalidatePath(`/admin/events`)
    return { success: true, template: data }
}

export async function getCertificateTemplate(eventId: string): Promise<(CertificateTemplate & { signedUrl?: string }) | null> {
    const supabase = await getSupabase()

    const { data, error } = await supabase
        .from('certificate_templates')
        .select('*')
        .eq('event_id', eventId)
        .single()

    if (error || !data) return null

    // Generate signed URL for template preview
    let signedUrl: string | undefined
    if (data.template_url) {
        try {
            const url = new URL(data.template_url)
            const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/certificates\/(.+)/)
            if (pathMatch && pathMatch[1]) {
                const { data: signedData } = await supabase.storage
                    .from('certificates')
                    .createSignedUrl(pathMatch[1], 3600) // 1 hour validity
                signedUrl = signedData?.signedUrl
            }
        } catch (e) {
            console.log('Could not generate signed URL for template preview:', e)
        }
    }

    return { ...(data as CertificateTemplate), signedUrl }
}

export async function deleteCertificateTemplate(eventId: string) {
    const session = await auth()
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        throw new Error("Unauthorized")
    }

    const supabase = await getSupabase()

    const { error } = await supabase
        .from('certificate_templates')
        .delete()
        .eq('event_id', eventId)

    if (error) {
        console.error("Delete Template Error:", error)
        throw new Error("Failed to delete certificate template")
    }

    revalidatePath(`/admin/events/${eventId}`)
    return { success: true }
}

// ==========================================
// Certificate Issuance (Admin)
// ==========================================

export interface ReleaseCertificatesOptions {
    eventId: string
    certificateType?: CertificateType
    roleTitle?: string
    sendEmails?: boolean
}

export async function releaseCertificates(options: ReleaseCertificatesOptions | string) {
    // Support both old (string) and new (object) signatures
    const opts: ReleaseCertificatesOptions = typeof options === 'string'
        ? { eventId: options }
        : options

    const { eventId, certificateType = 'participation', roleTitle, sendEmails = true } = opts

    const session = await auth()
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        throw new Error("Unauthorized")
    }

    const supabase = await getSupabase()

    // 1. Check if template exists
    const { data: template } = await supabase
        .from('certificate_templates')
        .select('id')
        .eq('event_id', eventId)
        .single()

    if (!template) {
        throw new Error("Certificate template not configured for this event")
    }

    // 2. Get event details for email
    const { data: event } = await supabase
        .from('events')
        .select('title, start_time, club_id, club:clubs!events_club_id_fkey(name)')
        .eq('id', eventId)
        .single()

    const clubData = event?.club as { name: string }[] | { name: string } | null
    const clubName = Array.isArray(clubData) ? clubData[0]?.name : clubData?.name

    // 3. Get all attended participants who don't have certificates yet
    const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('attended', true)

    if (regError) {
        console.error("Fetch Registrations Error:", regError)
        throw new Error("Failed to fetch registrations")
    }

    if (!registrations || registrations.length === 0) {
        throw new Error("No attended participants found for this event")
    }

    // 4. Get existing certificates to avoid duplicates
    const { data: existingCerts } = await supabase
        .from('certificates')
        .select('user_id')
        .eq('event_id', eventId)

    const existingUserIds = new Set(existingCerts?.map(c => c.user_id) || [])

    // 5. Filter out users who already have certificates
    const newParticipants = registrations.filter(r => !existingUserIds.has(r.user_id))

    if (newParticipants.length === 0) {
        // Just mark as released even if no new certificates
        await supabase.from('events').update({
            certificates_released: true,
            certificates_released_at: new Date().toISOString()
        }).eq('id', eventId)

        return { success: true, issued: 0, emailsSent: 0, message: "All participants already have certificates" }
    }

    // 6. Create certificates for new participants
    const certificatesToInsert = newParticipants.map(reg => ({
        event_id: eventId,
        user_id: reg.user_id,
        template_id: template.id,
        status: 'valid',
        certificate_type: certificateType,
        role_title: roleTitle || null
    }))

    const { data: insertedCerts, error: insertError } = await supabase
        .from('certificates')
        .insert(certificatesToInsert)
        .select('id, certificate_id, user_id')

    if (insertError) {
        console.error("Insert Certificates Error:", insertError)
        throw new Error("Failed to issue certificates")
    }

    // 7. Mark event as certificates released
    await supabase.from('events').update({
        certificates_released: true,
        certificates_released_at: new Date().toISOString()
    }).eq('id', eventId)

    // 8. Send email notifications (non-blocking)
    let emailsSent = 0
    if (sendEmails && insertedCerts && insertedCerts.length > 0) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.technovashardauniversity.in'

        // Get user details for email
        const userIds = insertedCerts.map(c => c.user_id)
        const { data: users } = await supabase
            .schema('next_auth')
            .from('users')
            .select('id, name, email')
            .in('id', userIds)

        const userMap = new Map(users?.map(u => [u.id, u]) || [])

        // Send emails
        for (const cert of insertedCerts) {
            try {
                const user = userMap.get(cert.user_id)
                if (!user?.email) continue

                const downloadUrl = `${baseUrl}/api/certificate?id=${cert.certificate_id}`
                const verifyUrl = `${baseUrl}/verify/${cert.certificate_id}`

                const emailHtml = await render(CertificateNotificationEmail({
                    userName: user.name || 'Student',
                    eventName: event?.title || 'Event',
                    eventDate: formatDateShort(event?.start_time || new Date().toISOString()),
                    organizerName: clubName || 'Technova',
                    certificateType: certificateType,
                    roleTitle: roleTitle,
                    downloadUrl,
                    verifyUrl
                }))

                await resend.emails.send({
                    from: 'Technova <noreply@technovashardauniversity.in>',
                    to: user.email,
                    subject: `🎉 Your Certificate for ${event?.title} is Ready!`,
                    html: emailHtml
                })

                emailsSent++
            } catch (emailError) {
                console.error("Email send error for cert:", cert.certificate_id, emailError)
                // Continue with other emails
            }
        }
    }

    revalidatePath(`/admin/events/${eventId}`)
    revalidatePath(`/admin/events/${eventId}/certificates`)

    return {
        success: true,
        issued: insertedCerts?.length || 0,
        emailsSent,
        message: `Successfully issued ${insertedCerts?.length || 0} certificates. ${emailsSent} emails sent.`
    }
}

export async function revokeCertificate(certificateId: string, reason: string) {
    const session = await auth()
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        throw new Error("Unauthorized")
    }

    const supabase = await getSupabase()

    const { data, error } = await supabase
        .from('certificates')
        .update({
            status: 'revoked',
            revoked_at: new Date().toISOString(),
            revoked_reason: reason
        })
        .eq('certificate_id', certificateId)
        .select()
        .single()

    if (error) {
        console.error("Revoke Certificate Error:", error)
        throw new Error("Failed to revoke certificate")
    }

    revalidatePath(`/admin/events/${data.event_id}/certificates`)
    return { success: true, certificate: data }
}

export async function reinstateCertificate(certificateId: string) {
    const session = await auth()
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        throw new Error("Unauthorized")
    }

    const supabase = await getSupabase()

    const { data, error } = await supabase
        .from('certificates')
        .update({
            status: 'valid',
            revoked_at: null,
            revoked_reason: null
        })
        .eq('certificate_id', certificateId)
        .select()
        .single()

    if (error) {
        console.error("Reinstate Certificate Error:", error)
        throw new Error("Failed to reinstate certificate")
    }

    revalidatePath(`/admin/events/${data.event_id}/certificates`)
    return { success: true, certificate: data }
}

// ==========================================
// Certificate Retrieval (Admin)
// ==========================================

export async function getEventCertificates(eventId: string) {
    const session = await auth()
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        throw new Error("Unauthorized")
    }

    const supabase = await getSupabase()

    // 1. Get certificates
    const { data: certificates, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('event_id', eventId)
        .order('issued_at', { ascending: false })

    if (error) {
        console.error("Fetch Certificates Error:", error)
        throw new Error("Failed to fetch certificates")
    }

    if (!certificates || certificates.length === 0) return []

    // 2. Get user details
    const userIds = certificates.map(c => c.user_id)
    const { data: users } = await supabase
        .schema('next_auth')
        .from('users')
        .select('id, name, email')
        .in('id', userIds)

    // 3. Merge data
    return certificates.map(cert => ({
        ...cert,
        user: users?.find(u => u.id === cert.user_id) || { name: 'Unknown', email: 'Unknown' }
    }))
}

export async function getCertificateStats(eventId: string) {
    const supabase = await getSupabase()

    const { count: totalCount } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)

    const { count: validCount } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'valid')

    const { count: revokedCount } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'revoked')

    // Get total downloads
    const { data: downloadData } = await supabase
        .from('certificates')
        .select('downloaded_count')
        .eq('event_id', eventId)

    const totalDownloads = downloadData?.reduce((sum, c) => sum + (c.downloaded_count || 0), 0) || 0

    return {
        total: totalCount || 0,
        valid: validCount || 0,
        revoked: revokedCount || 0,
        downloads: totalDownloads
    }
}

// ==========================================
// User Certificate Access
// ==========================================

export async function getUserCertificates() {
    const session = await auth()
    if (!session) {
        throw new Error("Unauthorized")
    }

    const supabase = await getSupabase()

    const { data: certificates, error } = await supabase
        .from('certificates')
        .select(`
            *,
            event:events!inner(title, start_time, club_id, club:clubs!events_club_id_fkey(name))
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'valid')
        .order('issued_at', { ascending: false })

    if (error) {
        console.error("Fetch User Certificates Error:", error)
        return []
    }

    return certificates || []
}

export async function getUserCertificateForEvent(eventId: string): Promise<Certificate | null> {
    const session = await auth()
    if (!session) return null

    const supabase = await getSupabase()

    const { data, error } = await supabase
        .from('certificates')
        .select(`
            *,
            event:events!inner(title, start_time, club_id, club:clubs!events_club_id_fkey(name))
        `)
        .eq('user_id', session.user.id)
        .eq('event_id', eventId)
        .single()

    if (error || !data) return null
    return data as Certificate
}

// ==========================================
// Public Verification
// ==========================================

export async function verifyCertificate(certificateId: string) {
    const supabase = await getSupabase()

    // 1. Get certificate with event and user details
    const { data: certificate, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_id', certificateId)
        .single()

    if (error || !certificate) {
        return { valid: false, error: 'Certificate not found' }
    }

    // 2. Get event details
    const { data: event } = await supabase
        .from('events')
        .select('title, start_time, club_id, club:clubs!events_club_id_fkey(name)')
        .eq('id', certificate.event_id)
        .single()

    // 3. Get user name
    const { data: user } = await supabase
        .schema('next_auth')
        .from('users')
        .select('name')
        .eq('id', certificate.user_id)
        .single()

    return {
        valid: certificate.status === 'valid',
        certificate: {
            ...certificate,
            event,
            user
        }
    }
}

// ==========================================
// Certificate Download Tracking
// ==========================================

export async function incrementDownloadCount(certificateId: string) {
    const supabase = await getSupabase()

    await supabase.rpc('increment_download_count', { cert_id: certificateId })
}

// Helper function to upload template to storage
export async function uploadCertificateTemplate(file: File, eventId: string) {
    const session = await auth()
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        throw new Error("Unauthorized")
    }

    const supabase = await getSupabase()

    const fileName = `${eventId}/${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage
        .from('certificates')
        .upload(fileName, file, {
            upsert: true
        })

    if (error) {
        console.error("Upload Error:", error)
        throw new Error("Failed to upload template")
    }

    const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(data.path)

    return publicUrl
}
