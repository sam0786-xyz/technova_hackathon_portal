import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { checkHackathonRole } from "@/lib/actions/hackathon"
import Link from "next/link"
import { ArrowLeft, LogOut } from "lucide-react"

export default async function HackathonPortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    const { role } = await checkHackathonRole()

    if (role === 'none') {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="text-center p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl max-w-md">
                    <h1 className="text-2xl font-bold text-red-400">Access Restricted</h1>
                    <p className="text-gray-400 mt-2">
                        You do not have access to the Hackathon Portal. Contact the organizers to get added as an evaluator or volunteer.
                    </p>
                    <Link href="/" className="inline-block mt-6 text-blue-400 hover:text-blue-300 underline">
                        Return Home
                    </Link>
                </div>
            </div>
        )
    }

    const roleBadgeColors = {
        organizer: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        evaluator: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        volunteer: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    }

    const roleLabels = {
        organizer: '🛡️ Organizer',
        evaluator: '📋 Evaluator',
        volunteer: '🎯 Volunteer',
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Top Header Bar */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/10">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Link>
                        <div className="w-px h-6 bg-white/10" />
                        <h1 className="font-bold text-lg text-white">Hackathon Portal</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${roleBadgeColors[role]}`}>
                            {roleLabels[role]}
                        </span>
                        <span className="text-sm text-gray-400 hidden sm:block">{session.user.name}</span>
                    </div>
                </div>
            </header>
            {children}
        </div>
    )
}
