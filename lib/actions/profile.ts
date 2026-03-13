'use server'

import { createClient as createServerClient } from "@supabase/supabase-js"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function getSupabase() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function updateProfile(formData: FormData) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        throw new Error("Not authenticated")
    }

    const supabase = await getSupabase()
    const userId = session.user.id

    const section = (formData.get("section") as string) || null
    const system_id = (formData.get("system_id") as string) || null
    const yearStr = formData.get("year") as string
    const year = yearStr ? parseInt(yearStr) : null
    const course = (formData.get("course") as string) || null
    const mobile = (formData.get("mobile") as string) || null
    const skills = (formData.get("skills") as string).split(',').map(s => s.trim()).filter(s => s.length > 0)

    // Social Links
    const github_url = (formData.get("github_url") as string) || null
    const linkedin_url = (formData.get("linkedin_url") as string) || null
    const portfolio_url = (formData.get("portfolio_url") as string) || null
    const kaggle_url = (formData.get("kaggle_url") as string) || null
    const leetcode_url = (formData.get("leetcode_url") as string) || null
    const codeforces_url = (formData.get("codeforces_url") as string) || null
    const codechef_url = (formData.get("codechef_url") as string) || null
    const gfg_url = (formData.get("gfg_url") as string) || null
    const hackerrank_url = (formData.get("hackerrank_url") as string) || null

    // 1. Update User Details (next_auth.users)
    const { error: userError } = await supabase.schema('next_auth').from('users').update({
        section,
        system_id,
        year,
        course,
        mobile
    }).eq('id', userId)

    if (userError) {
        console.error("User Update Error:", userError)
        return { error: "Failed to update basic info" }
    }

    // 2. Update Profile Details (public.profiles)
    // Check if profile exists first
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', userId).single()

    if (!profile) {
        await supabase.from('profiles').insert({
            id: userId,
            skills,
            github_url,
            linkedin_url,
            portfolio_url,
            kaggle_url,
            leetcode_url,
            codeforces_url,
            codechef_url,
            gfg_url,
            hackerrank_url
        })
    } else {
        await supabase.from('profiles').update({
            skills,
            github_url,
            linkedin_url,
            portfolio_url,
            kaggle_url,
            leetcode_url,
            codeforces_url,
            codechef_url,
            gfg_url,
            hackerrank_url
        }).eq('id', userId)
    }

    revalidatePath("/profile/edit")
    revalidatePath("/buddy-finder")
    return { success: true }
}

export async function getProfileData() {
    const session = await auth()
    if (!session || !session.user) return null

    const supabase = await getSupabase()
    const userId = session.user.id

    // Fetch User Data
    const { data: user } = await supabase.schema('next_auth').from('users').select('*').eq('id', userId).single()

    // Fetch Profile Data
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()

    return {
        ...user,
        skills: profile?.skills || [],
        github_url: profile?.github_url || null,
        linkedin_url: profile?.linkedin_url || null,
        portfolio_url: profile?.portfolio_url || null,
        kaggle_url: profile?.kaggle_url || null,
        leetcode_url: profile?.leetcode_url || null,
        codeforces_url: profile?.codeforces_url || null,
        codechef_url: profile?.codechef_url || null,
        gfg_url: profile?.gfg_url || null,
        hackerrank_url: profile?.hackerrank_url || null
    }
}

export async function searchBuddies(query?: string, skill?: string) {
    const supabase = await getSupabase()

    // Use query as the unified search term (skill param kept for backwards compatibility)
    const searchTerm = (query || skill || '').toLowerCase().trim()

    // Get all profiles first (we'll filter in JS for case-insensitive matching)
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, skills')

    if (profilesError) {
        console.error("Search Buddies Error:", profilesError)
        return []
    }

    if (!profiles || profiles.length === 0) {
        return []
    }

    // Get user IDs from profiles
    const userIds = profiles.map((p: any) => p.id)

    // Fetch user details from next_auth.users in chunks to avoid URL length limits
    const chunkSize = 100;
    let allUsers: any[] = [];

    for (let i = 0; i < userIds.length; i += chunkSize) {
        const chunk = userIds.slice(i, i + chunkSize);
        const { data: usersChunk, error: usersError } = await supabase
            .schema('next_auth')
            .from('users')
            .select('id, name, image, role, course, year, email')
            .in('id', chunk);

        if (usersError) {
            console.error("Search Users Error:", usersError);
            return [];
        }

        if (usersChunk) {
            allUsers = allUsers.concat(usersChunk);
        }
    }

    // Create a map of profiles by id for quick lookup
    const profilesMap = new Map(profiles.map((p: any) => [p.id, p.skills]))

    // Combine users with their skills
    let buddies = allUsers.map((user: any) => ({
        id: user.id,
        name: user.name,
        image: user.image,
        role: user.role,
        course: user.course,
        year: user.year,
        email: user.email,
        skills: profilesMap.get(user.id) || []
    }))

    // Filter by search term (case-insensitive) - matches name OR skills
    if (searchTerm !== '') {
        buddies = buddies.filter(b => {
            // Check if name matches (partial, case-insensitive)
            const nameMatch = b.name ? b.name.toLowerCase().includes(searchTerm) : false

            // Check if any skill matches (partial, case-insensitive)
            let skillMatch = false
            if (b.skills && Array.isArray(b.skills) && b.skills.length > 0) {
                skillMatch = b.skills.some((s: string) =>
                    s && typeof s === 'string' && s.toLowerCase().includes(searchTerm)
                )
            }

            return nameMatch || skillMatch
        })
    }

    return buddies
}
