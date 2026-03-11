import NextAuth from "next-auth"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { config } from "./config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...config,
    adapter: SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    }),
})
