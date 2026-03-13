/**
 * Convert a string to a URL-safe slug
 * @param text - The text to slugify (e.g., event title)
 * @param suffix - Optional suffix to ensure uniqueness (e.g., short id)
 */
export function slugify(text: string, suffix?: string): string {
    let slug = text
        .toLowerCase()
        .trim()
        // Replace special characters with their ASCII equivalents
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Replace spaces and underscores with hyphens
        .replace(/[\s_]+/g, '-')
        // Remove all non-alphanumeric characters except hyphens
        .replace(/[^a-z0-9-]/g, '')
        // Remove multiple consecutive hyphens
        .replace(/-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, '')

    // Limit length to keep URLs reasonable
    if (slug.length > 50) {
        slug = slug.substring(0, 50).replace(/-+$/, '')
    }

    // Add suffix if provided
    if (suffix) {
        slug = `${slug}-${suffix}`
    }

    return slug
}

/**
 * Generate a unique slug for an event
 * @param title - Event title
 * @param id - Event UUID (used to ensure uniqueness)
 */
export function generateEventSlug(title: string, id: string): string {
    // Use first 8 characters of UUID as suffix for uniqueness
    const shortId = id.substring(0, 8)
    return slugify(title, shortId)
}
