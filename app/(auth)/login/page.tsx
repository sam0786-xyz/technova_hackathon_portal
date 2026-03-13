'use client'

import { LoginButton } from "@/components/auth/login-button"
import { Shield, Sparkles, Zap, Users, Code2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white selection:bg-blue-500 selection:text-white relative overflow-hidden">
            {/* Background Effects - matching main website */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-cyan-600/15 rounded-full blur-[80px]" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Main Card - matching website glassmorphism style */}
                <div className="p-8 md:p-10 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 hover:border-blue-500/40 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">

                    {/* Logo Section */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block mb-6">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/assets/logo/technova-white.png"
                                alt="Technova Logo"
                                className="h-20 w-auto object-contain mx-auto"
                            />
                        </Link>

                        <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-xl">
                            <span className="text-blue-400 font-medium text-xs tracking-wider uppercase">Technical Society of Sharda University</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                            Welcome Back
                        </h1>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Sign in to access events, clubs, and more
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {[
                            { icon: Code2, text: "Tech Events" },
                            { icon: Users, text: "8+ Clubs" },
                            { icon: Zap, text: "Workshops" },
                            { icon: Sparkles, text: "Hackathons" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 text-gray-400 text-sm group">
                                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <item.icon className="w-4 h-4 text-blue-500" />
                                </div>
                                <span className="group-hover:text-gray-300 transition-colors">{item.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Auth Info Box */}
                    <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                                <Shield className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm mb-1">Sharda Students Only</p>
                                <p className="text-gray-400 text-xs leading-relaxed">
                                    Sign in with your official Sharda email<br />
                                    <span className="text-gray-500">(@ug.sharda.ac.in or @pg.sharda.ac.in)</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Login Button */}
                    <LoginButton />

                    {/* Terms */}
                    <p className="text-center text-gray-500 text-xs mt-6">
                        By signing in, you agree to our{' '}
                        <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors underline underline-offset-2">
                            Terms of Service
                        </Link>
                    </p>
                </div>

                {/* Back to Home Link */}
                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-400 text-sm font-medium transition-colors"
                    >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        Back to Home
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 text-xs mt-4">
                    © {new Date().getFullYear()} Technova Technical Society
                </p>
            </div>
        </div>
    )
}
