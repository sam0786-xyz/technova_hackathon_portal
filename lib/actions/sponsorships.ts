'use server'

import { createClient as createServerClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

async function getSupabase() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function addSponsorship(formData: FormData) {
    const supabase = await getSupabase()
    const source = formData.get("source") as string
    const amount = parseFloat(formData.get("amount") as string)
    const date = formData.get("date") as string || new Date().toISOString()

    const { error } = await supabase.from('sponsorships').insert({
        source,
        amount,
        received_at: date
    })

    if (error) {
        console.error("Add Sponsorship Error:", error)
        throw new Error("Failed to add sponsorship")
    }

    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/settings")
}

export async function getSponsorships() {
    const supabase = await getSupabase()
    const { data } = await supabase.from('sponsorships').select('*').order('received_at', { ascending: false })
    return data || []
}

export async function deleteSponsorship(id: string) {
    const supabase = await getSupabase()
    await supabase.from('sponsorships').delete().eq('id', id)
    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/settings")
}
