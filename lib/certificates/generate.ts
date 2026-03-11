import { PDFDocument, rgb, StandardFonts, PDFImage, PDFFont } from 'pdf-lib'
import { generateCertificateQRBuffer } from '@/lib/qr/generate'
import type { QRRegion, TextRegion, TextFieldType } from '@/types/custom'

// ==========================================
// Types
// ==========================================

export interface CertificateData {
    participantName: string
    eventName: string
    eventDate: string
    certificateId: string
    organizerName?: string
    roleTitle?: string
}

export interface CertificateGenerationOptions {
    templateUrl?: string
    qrRegion: QRRegion
    textRegions: TextRegion[]
    data: CertificateData
    baseUrl?: string
}

// ==========================================
// Legacy Certificate Generation (Fallback)
// ==========================================

export async function generateCertificate(
    userName: string,
    eventTitle: string,
    eventDate: string,
    certificateId?: string
): Promise<Uint8Array> {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()

    // Add a page (A4 landscape)
    const page = pdfDoc.addPage([842, 595]) // A4 landscape in points

    // Get fonts
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)

    const { width, height } = page.getSize()

    // Draw border
    page.drawRectangle({
        x: 30,
        y: 30,
        width: width - 60,
        height: height - 60,
        borderColor: rgb(0.1, 0.3, 0.6),
        borderWidth: 3,
    })

    // Inner border
    page.drawRectangle({
        x: 40,
        y: 40,
        width: width - 80,
        height: height - 80,
        borderColor: rgb(0.6, 0.7, 0.8),
        borderWidth: 1,
    })

    // Title
    page.drawText('CERTIFICATE OF PARTICIPATION', {
        x: width / 2 - 200,
        y: height - 120,
        size: 28,
        font: timesRomanBold,
        color: rgb(0.1, 0.2, 0.5),
    })

    // Subtitle
    page.drawText('This is to certify that', {
        x: width / 2 - 80,
        y: height - 200,
        size: 16,
        font: timesRoman,
        color: rgb(0.3, 0.3, 0.3),
    })

    // User Name
    const nameWidth = timesRomanBold.widthOfTextAtSize(userName, 36)
    page.drawText(userName, {
        x: (width - nameWidth) / 2,
        y: height - 260,
        size: 36,
        font: timesRomanBold,
        color: rgb(0, 0, 0),
    })

    // Line under name
    page.drawLine({
        start: { x: width / 2 - 150, y: height - 275 },
        end: { x: width / 2 + 150, y: height - 275 },
        thickness: 1,
        color: rgb(0.3, 0.3, 0.3),
    })

    // Participation text
    page.drawText('has successfully participated in', {
        x: width / 2 - 100,
        y: height - 320,
        size: 16,
        font: timesRoman,
        color: rgb(0.3, 0.3, 0.3),
    })

    // Event Title
    const eventWidth = timesRomanBold.widthOfTextAtSize(eventTitle, 24)
    page.drawText(eventTitle, {
        x: (width - eventWidth) / 2,
        y: height - 370,
        size: 24,
        font: timesRomanBold,
        color: rgb(0.1, 0.3, 0.6),
    })

    // Date
    page.drawText(`held on ${eventDate}`, {
        x: width / 2 - 60,
        y: height - 420,
        size: 14,
        font: timesRoman,
        color: rgb(0.4, 0.4, 0.4),
    })

    // Add QR Code if certificate ID is provided
    if (certificateId) {
        try {
            const qrBuffer = await generateCertificateQRBuffer(certificateId, 100)
            const qrImage = await pdfDoc.embedPng(qrBuffer)

            page.drawImage(qrImage, {
                x: width - 140,
                y: 50,
                width: 80,
                height: 80,
            })

            // Certificate ID text below QR
            page.drawText(`ID: ${certificateId}`, {
                x: width - 140,
                y: 35,
                size: 8,
                font: timesRoman,
                color: rgb(0.5, 0.5, 0.5),
            })
        } catch (error) {
            console.error('Failed to embed QR code:', error)
        }
    }

    // Footer
    page.drawText('Technova - SET Technical Society', {
        x: width / 2 - 100,
        y: 80,
        size: 12,
        font: timesRoman,
        color: rgb(0.5, 0.5, 0.5),
    })

    page.drawText('Sharda University', {
        x: width / 2 - 50,
        y: 60,
        size: 10,
        font: timesRoman,
        color: rgb(0.6, 0.6, 0.6),
    })

    // Serialize the PDF to bytes
    return await pdfDoc.save()
}

// ==========================================
// Template-Based Certificate Generation
// ==========================================

export async function generateCertificateFromTemplate(
    options: CertificateGenerationOptions
): Promise<Uint8Array> {
    const { templateUrl, qrRegion, textRegions, data, baseUrl } = options

    // If no template URL, use legacy generation
    if (!templateUrl) {
        return generateCertificate(
            data.participantName,
            data.eventName,
            data.eventDate,
            data.certificateId
        )
    }

    // Fetch template image
    let templateBuffer: ArrayBuffer
    try {
        const response = await fetch(templateUrl)
        if (!response.ok) {
            throw new Error(`Failed to fetch template: ${response.status}`)
        }
        templateBuffer = await response.arrayBuffer()
    } catch (error) {
        console.error('Failed to fetch template, using fallback:', error)
        return generateCertificate(
            data.participantName,
            data.eventName,
            data.eventDate,
            data.certificateId
        )
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create()

    // Determine template type and embed
    let templateImage: PDFImage
    const templateUrlLower = templateUrl.toLowerCase()

    try {
        if (templateUrlLower.endsWith('.png')) {
            templateImage = await pdfDoc.embedPng(templateBuffer)
        } else if (templateUrlLower.endsWith('.jpg') || templateUrlLower.endsWith('.jpeg')) {
            templateImage = await pdfDoc.embedJpg(templateBuffer)
        } else {
            // Try PNG first, then JPEG
            try {
                templateImage = await pdfDoc.embedPng(templateBuffer)
            } catch {
                templateImage = await pdfDoc.embedJpg(templateBuffer)
            }
        }
    } catch (error) {
        console.error('Failed to embed template image:', error)
        return generateCertificate(
            data.participantName,
            data.eventName,
            data.eventDate,
            data.certificateId
        )
    }

    // Get template dimensions (maintain aspect ratio, fit in A4 landscape)
    const templateWidth = templateImage.width
    const templateHeight = templateImage.height

    // Create page with same aspect ratio as template
    // Scale to reasonable PDF size (max 842x595 for A4 landscape)
    const maxWidth = 842
    const maxHeight = 595
    const scale = Math.min(maxWidth / templateWidth, maxHeight / templateHeight)
    const pageWidth = templateWidth * scale
    const pageHeight = templateHeight * scale

    const page = pdfDoc.addPage([pageWidth, pageHeight])

    // Draw template as background
    page.drawImage(templateImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
    })

    // Get fonts
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // Get field value helper
    const getFieldValue = (field: TextFieldType): string => {
        switch (field) {
            case 'participant_name':
                return data.participantName
            case 'event_name':
                return data.eventName
            case 'event_date':
                return data.eventDate
            case 'certificate_id':
                return data.certificateId
            case 'organizer_name':
                return data.organizerName || 'Technova'
            case 'role_title':
                return data.roleTitle || ''
            default:
                return ''
        }
    }

    // Draw text regions
    for (const region of textRegions) {
        const text = getFieldValue(region.field)
        if (!text) continue

        // Convert percentage to actual coordinates
        // Note: PDF coordinates start from bottom-left
        const x = (region.x / 100) * pageWidth
        const y = pageHeight - ((region.y / 100) * pageHeight) // Invert Y for PDF

        // Parse color (hex to RGB)
        const color = hexToRgb(region.color || '#000000')

        // Select font
        const font = region.fontWeight === 'bold' ? fontBold : fontRegular

        // Scale font size proportionally to page dimensions
        // The editor uses fontSize as a relative value - we scale it based on page height
        // A baseline of 800px height is used as reference (typical certificate size in editor)
        const baselineHeight = 800
        const fontScaleFactor = pageHeight / baselineHeight
        const fontSize = Math.round((region.fontSize || 24) * fontScaleFactor)

        const textWidth = font.widthOfTextAtSize(text, fontSize)

        let textX = x
        if (region.alignment === 'center') {
            textX = x - textWidth / 2
        } else if (region.alignment === 'right') {
            textX = x - textWidth
        }

        // Adjust Y position - move up by half the font height for better centering
        const adjustedY = y - fontSize / 2

        page.drawText(text, {
            x: textX,
            y: adjustedY,
            size: fontSize,
            font: font,
            color: rgb(color.r, color.g, color.b),
        })
    }

    // Draw QR Code
    if (data.certificateId && qrRegion) {
        try {
            // Calculate QR size based on region width
            const qrWidth = (qrRegion.width / 100) * pageWidth
            const qrHeight = (qrRegion.height / 100) * pageHeight
            const qrSize = Math.min(qrWidth, qrHeight) // Keep square

            const qrBuffer = await generateCertificateQRBuffer(
                data.certificateId,
                Math.round(qrSize * 2), // Generate at 2x for quality
                baseUrl
            )

            const qrImage = await pdfDoc.embedPng(qrBuffer)

            // Convert percentage to coordinates
            const qrX = (qrRegion.x / 100) * pageWidth
            const qrY = pageHeight - ((qrRegion.y / 100) * pageHeight) - qrSize // Invert Y

            page.drawImage(qrImage, {
                x: qrX,
                y: qrY,
                width: qrSize,
                height: qrSize,
            })
        } catch (error) {
            console.error('Failed to embed QR code:', error)
        }
    }

    return await pdfDoc.save()
}

// ==========================================
// Utility Functions
// ==========================================

function hexToRgb(hex: string): { r: number, g: number, b: number } {
    // Remove # if present
    hex = hex.replace(/^#/, '')

    // Parse hex values
    const bigint = parseInt(hex, 16)
    const r = ((bigint >> 16) & 255) / 255
    const g = ((bigint >> 8) & 255) / 255
    const b = (bigint & 255) / 255

    return { r, g, b }
}

// Generate certificate with all options
export async function generateCertificateWithTemplate(
    templateUrl: string | null,
    qrRegion: QRRegion | null,
    textRegions: TextRegion[],
    data: CertificateData,
    baseUrl?: string
): Promise<Uint8Array> {
    if (templateUrl && qrRegion) {
        return generateCertificateFromTemplate({
            templateUrl,
            qrRegion,
            textRegions,
            data,
            baseUrl
        })
    }

    // Fallback to legacy generation
    return generateCertificate(
        data.participantName,
        data.eventName,
        data.eventDate,
        data.certificateId
    )
}
