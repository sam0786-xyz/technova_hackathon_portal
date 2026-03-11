import { checkHackathonRole } from "@/lib/actions/hackathon"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ClipboardList, QrCode, Settings, Radio, Users, UserCheck } from "lucide-react"

export default async function HackathonPortalHub() {
    const { role, user } = await checkHackathonRole()
    if (role === 'none') redirect("/")

    const cards = []

    // Organizer gets everything
    if (role === 'organizer') {
        cards.push(
            {
                title: "Manage Hackathon",
                desc: "Teams, evaluators, volunteers, timer, schedule, data downloads",
                href: "/hackathon-portal/manage",
                icon: Settings,
                gradient: "from-purple-600/20 to-purple-500/10",
                border: "border-purple-500/30 hover:border-purple-500/50",
                iconColor: "text-purple-400",
            },
            {
                title: "Evaluate Teams",
                desc: "Score teams across rubric categories",
                href: "/hackathon-portal/evaluate",
                icon: ClipboardList,
                gradient: "from-blue-600/20 to-blue-500/10",
                border: "border-blue-500/30 hover:border-blue-500/50",
                iconColor: "text-blue-400",
            },
            {
                title: "Verify & Track",
                desc: "QR scan for check-in, checkout, and meals",
                href: "/hackathon-portal/scan",
                icon: QrCode,
                gradient: "from-emerald-600/20 to-emerald-500/10",
                border: "border-emerald-500/30 hover:border-emerald-500/50",
                iconColor: "text-emerald-400",
            },
            {
                title: "Volunteer Scanner",
                desc: "Scan volunteer QR codes to track attendance",
                href: "/hackathon-portal/volunteer-scan",
                icon: UserCheck,
                gradient: "from-violet-600/20 to-violet-500/10",
                border: "border-violet-500/30 hover:border-violet-500/50",
                iconColor: "text-violet-400",
            },
            {
                title: "Live Dashboard",
                desc: "View the public-facing timer & schedule",
                href: "/hackathon/live",
                icon: Radio,
                gradient: "from-amber-600/20 to-amber-500/10",
                border: "border-amber-500/30 hover:border-amber-500/50",
                iconColor: "text-amber-400",
            },
        )
    }

    // Evaluator gets evaluation
    if (role === 'evaluator') {
        cards.push({
            title: "Evaluate Teams",
            desc: "Score teams across rubric categories",
            href: "/hackathon-portal/evaluate",
            icon: ClipboardList,
            gradient: "from-blue-600/20 to-blue-500/10",
            border: "border-blue-500/30 hover:border-blue-500/50",
            iconColor: "text-blue-400",
        })
    }

    // Volunteer gets scanner
    if (role === 'volunteer') {
        cards.push({
            title: "Verify & Track",
            desc: "QR scan for check-in, checkout, and meals",
            href: "/hackathon-portal/scan",
            icon: QrCode,
            gradient: "from-emerald-600/20 to-emerald-500/10",
            border: "border-emerald-500/30 hover:border-emerald-500/50",
            iconColor: "text-emerald-400",
        })
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Hackathon Portal</h1>
                <p className="text-gray-400">
                    Welcome, <span className="text-white font-medium">{user?.name}</span>
                </p>
            </div>

            <div className={`grid gap-6 ${cards.length > 2 ? 'md:grid-cols-2' : cards.length === 1 ? 'max-w-md mx-auto' : 'md:grid-cols-2 max-w-2xl mx-auto'}`}>
                {cards.map((card) => (
                    <Link key={card.href} href={card.href}>
                        <div className={`bg-gradient-to-br ${card.gradient} border ${card.border} rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer group h-full`}>
                            <card.icon className={`w-10 h-10 ${card.iconColor} mb-4 group-hover:scale-110 transition-transform`} />
                            <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                            <p className="text-gray-400 text-sm">{card.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
