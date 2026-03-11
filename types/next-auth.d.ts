import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            role: 'student' | 'admin' | 'super_admin' | 'evaluator' | 'student_lead'
            system_id?: string | null
        } & DefaultSession["user"]
    }

    interface User {
        role?: 'student' | 'admin' | 'super_admin' | 'evaluator' | 'student_lead'
        system_id?: string | null
        year?: number | null
        course?: string | null
        section?: string | null
        xp_points?: number | null
    }
}
