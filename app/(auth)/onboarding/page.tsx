import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { OnboardingForm } from "@/components/auth/onboarding-form"
import { Shield, Sparkles, Users, Zap } from "lucide-react"
import Link from "next/link"

export default async function OnboardingPage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    // If evaluator, skip onboarding and go to evaluator portal
    if (session.user.role === 'evaluator') {
        redirect("/evaluate")
    }

    // If already completed, redirect to dashboard
    if (session.user.system_id) {
        redirect("/dashboard")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white selection:bg-blue-500 selection:text-white relative overflow-hidden py-12 px-4">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-cyan-600/15 rounded-full blur-[80px]" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-2xl">
                {/* Main Card */}
                <div className="p-8 md:p-10 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block mb-6">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/assets/logo/technova-white.png"
                                alt="Technova Logo"
                                className="h-16 w-auto object-contain mx-auto"
                            />
                        </Link>

                        <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-xl">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 font-medium text-xs tracking-wider uppercase">Welcome to Technova</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                            Complete Your Profile
                        </h1>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
                            Hey{session.user.name ? ` ${session.user.name.split(' ')[0]}` : ''}! We need a few more details to set up your Technova experience.
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {[
                            { icon: Users, text: "Find Teammates" },
                            { icon: Zap, text: "Join Events" },
                            { icon: Shield, text: "Get Verified" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                                    <item.icon className="w-5 h-5 text-blue-500" />
                                </div>
                                <span className="text-xs text-gray-400 text-center">{item.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Form */}
                    <OnboardingForm userId={session.user.id} userName={session.user.name || undefined} />
                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 text-xs mt-6">
                    © {new Date().getFullYear()} Technova Technical Society — Sharda University
                </p>
            </div>
        </div>
    )
}
