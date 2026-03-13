
// Explicit list of admin emails
export const ADMIN_EMAILS = [
    'clubdatapool.technova@gmail.com',
    'clubaiandrobotics.technova@gmail.com',
    'clubgithub.technova@gmail.com',
    'clubpixelance.technova@gmail.com',
    'clubgamedrifters.technova@gmail.com',
    'clubcyberpirates.technova@gmail.com',
    'awscloudclub.sharda.university@gmail.com',
    'dsc.sharda.uni@gmail.com',
    'clubtechpreneur.technova@gmail.com',
    'piyush.sharma.code@gmail.com',
    'rani.astya@sharda.ac.in',
];

// Helper to determine role from email
export function getRoleFromEmail(email: string): 'student' | 'admin' | 'super_admin' {
    // technova@sharda.ac.in is super_admin
    if (email === 'technova@sharda.ac.in') {
        return 'super_admin'
    }

    // Check explicit admin list
    if (ADMIN_EMAILS.includes(email)) {
        return 'super_admin'
    }

    // Students: @ug.sharda.ac.in or @pg.sharda.ac.in
    return 'student'
}

// Helper to check if email is allowed
export function isEmailAllowed(email: string): boolean {
    // Exact match for main technova account
    if (email === 'technova@sharda.ac.in') return true

    // Check explicit admin list
    if (ADMIN_EMAILS.includes(email)) return true

    // Student domains
    if (email.endsWith('@ug.sharda.ac.in')) return true
    if (email.endsWith('@pg.sharda.ac.in')) return true

    return false
}

