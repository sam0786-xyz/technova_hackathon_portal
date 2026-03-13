'use client'

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Infinity as InfinityIcon, Zap, Code2, Users, Rocket, Target, Clock, Trophy, Download, ChevronRight } from 'lucide-react'
import { VenueCarousel } from '@/components/hackathon/venue-carousel'
import { HeartPulse, BookOpen, Coins, ShieldAlert, LineChart, Globe, IndianRupee, Award, Star, ListChecks, CalendarDays, CheckCircle2, Circle, Terminal, Plane, Train, TrainFront, Navigation, Map, Cpu, Building2, Timer, GraduationCap } from 'lucide-react'
import { useEffect, useState, MouseEvent } from 'react'

const REGISTRATION_LINK = "https://docs.google.com/forms/d/e/1FAIpQLScDLjm7HDdkKXJqVIIQr9zp-cG95vnCrdNy2gjEtJtjxaZBXA/viewform"

function FloatingParticles() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white rounded-full blur-[2px]"
                    style={{
                        width: Math.random() * 4 + 1 + 'px',
                        height: Math.random() * 4 + 1 + 'px',
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.5 + 0.1,
                    }}
                    animate={{
                        y: [0, -40, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                    }}
                    transition={{
                        duration: Math.random() * 5 + 5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    )
}

export default function HackathonPage() {
    const [currentDate, setCurrentDate] = useState<Date | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [progress, setProgress] = useState(0)
    const [revealedContacts, setRevealedContacts] = useState<number[]>([])
    const [activeTrack, setActiveTrack] = useState<number | null>(null)
    const [liveData, setLiveData] = useState<{ settings: any; schedule: any[]; shortlistedTeams: any[] } | null>(null)

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const backgroundGlow = useMotionTemplate`
        radial-gradient(
            500px circle at ${mouseX}px ${mouseY}px,
            rgba(147, 51, 234, 0.15),
            transparent 80%
        )
    `

    const handleMouseMove = ({ clientX, clientY, currentTarget }: MouseEvent) => {
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
    }

    useEffect(() => {
        setCurrentDate(new Date())

        // Cyber Loader Sequence
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval)
                    setTimeout(() => setIsLoading(false), 500)
                    return 100
                }
                return p + Math.floor(Math.random() * 15) + 5
            })
        }, 150)

        return () => clearInterval(interval)
    }, [])

    // Fetch live dashboard data
    useEffect(() => {
        async function fetchLiveData() {
            try {
                const res = await fetch('/api/hackathon-live')
                if (res.ok) {
                    const data = await res.json()
                    setLiveData(data)
                }
            } catch (e) {
                console.error('Failed to fetch live data', e)
            }
        }
        fetchLiveData()
        const liveInterval = setInterval(fetchLiveData, 15000)
        return () => clearInterval(liveInterval)
    }, [])

    const timelineEvents = [
        { date: "14 Feb 2026", title: "Registrations Open", timestamp: new Date("2026-02-14").getTime() },
        { date: "14 Mar 2026", title: "Registration Closes", timestamp: new Date("2026-03-14").getTime() },
        { date: "16-18 Mar 2026", title: "1st Round Screening (Online)", timestamp: new Date("2026-03-16").getTime() },
        { date: "24 Mar 2026", title: "Shortlisted Teams Declared", timestamp: new Date("2026-03-24").getTime() },
        { date: "10-11 Apr 2026", title: "Grand Finale (24Hr Offline)", timestamp: new Date("2026-04-10T09:00:00").getTime() }
    ]

    const getNextEventDetails = () => {
        if (!currentDate) return null
        const now = currentDate.getTime()
        const nextEvent = timelineEvents.find(e => e.timestamp > now)

        if (!nextEvent) return { text: "Hackathon Concluded", color: "text-gray-500" }

        const diff = nextEvent.timestamp - now
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

        if (days > 0) return { text: `${days} Days, ${hours} Hrs until ${nextEvent.title}`, color: "text-blue-400", isNext: true }
        if (hours > 0) return { text: `${hours} Hrs until ${nextEvent.title}`, color: "text-rose-400 animate-pulse", isNext: true }
        return { text: `Happening Now: ${nextEvent.title}`, color: "text-green-400 animate-pulse", isNext: true }
    }

    const nextEventInfo = getNextEventDetails()

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] text-green-500 flex flex-col items-center justify-center font-mono relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.1)_0%,transparent_100%)]" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="z-10 flex flex-col items-center max-w-md w-full px-8"
                >
                    <Terminal className="w-16 h-16 mb-6 text-green-500/80" />
                    <div className="text-xl mb-2 font-bold tracking-widest text-green-400 shadow-green-500/50 drop-shadow-md">INITIALIZING DEV_SPACE</div>
                    <div className="text-xs text-green-600 mb-8 tracking-[0.3em]">HACKATHON_PROTOCOL_V.25</div>

                    <div className="w-full h-1 bg-green-900/30 rounded-full overflow-hidden relative">
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "easeOut" }}
                        />
                    </div>

                    <div className="w-full flex justify-between mt-3 text-xs text-green-600/80">
                        <span>SYS.BOOT...</span>
                        <span>{Math.min(progress, 100)}%</span>
                    </div>

                    <div className="mt-12 text-left w-full space-y-1 text-[10px] text-green-700/50 opacity-50">
                        <p>{'>'} Loading assets_manifest.json [200 OK]</p>
                        <p>{'>'} Establishing secure connection to /events/hackathon</p>
                        <p>{'>'} Decrypting prize pool parameters...</p>
                        {progress > 50 && <p className="text-green-500/80">{'>'} Access Granted. Welcome, Developer.</p>}
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 relative overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            {/* Dynamic Mouse Glow Backdrop */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-0 opacity-40 mix-blend-screen transition-opacity duration-300 hidden md:block"
                style={{
                    background: backgroundGlow
                }}
            />

            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-purple-900/10 rounded-full blur-[150px] opacity-70 translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[150px] opacity-70 -translate-x-1/2 translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-pink-900/10 rounded-full blur-[150px] opacity-40 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
            </div>

            <FloatingParticles />

            <div className="container mx-auto px-4 relative z-10 pt-24 pb-32">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-12 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column: Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md">
                                <Zap className="w-5 h-5 text-purple-400" />
                                <span className="text-purple-400 font-bold uppercase tracking-widest text-sm">Registrations Open</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                <Award className="w-5 h-5 text-amber-500" />
                                <span className="text-amber-500 font-bold uppercase tracking-widest text-sm">8th Edition</span>
                            </div>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-[1.1] relative">
                            <motion.span
                                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-white to-green-500"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                INNOVATE BHARAT
                            </motion.span>
                            <br />
                            <motion.span
                                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 relative"
                                animate={{
                                    textShadow: [
                                        "0 0 20px rgba(168,85,247,0.5)",
                                        "3px 0 0 rgba(249,115,22,0.5), -3px 0 0 rgba(34,197,94,0.5)",
                                        "0 0 20px rgba(168,85,247,0.5)"
                                    ]
                                }}
                                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                            >
                                24 Hrs HACKATHON
                            </motion.span>
                        </h1>

                        <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl">
                            Innovating Today for a Sustainable Tomorrow. Join the ultimate test of endurance, creativity, and coding skills at Sharda University.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-16">
                            <motion.a
                                href={REGISTRATION_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-lg overflow-hidden transition-all shadow-[0_0_40px_rgba(147,51,234,0.4)] hover:shadow-[0_0_60px_rgba(147,51,234,0.6)] flex items-center justify-center gap-3"
                            >
                                <span className="relative z-10 text-white">Register Team</span>
                                <ExternalLink className="w-5 h-5 relative z-10 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </motion.a>
                            <motion.a
                                href="https://drive.google.com/file/d/1hTMH6CHzvjqZ9pWRB2wRnHlwBS_EpDdh/view?usp=sharing"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-lg overflow-hidden transition-all hover:bg-white/10 flex items-center justify-center gap-3"
                            >
                                <span className="relative z-10 text-white">Download Brochure</span>
                                <Download className="w-5 h-5 relative z-10 text-white group-hover:translate-y-1 transition-transform" />
                            </motion.a>
                        </div>

                        {/* Quick Stats: Telemetry Panels Removed */}
                    </motion.div>

                    {/* Right Column: Visuals/Details */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        {/* 3D Glassmorphism Card */}
                        <div className="relative rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 pt-12 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
                            {/* Accent line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                            <h3 className="text-3xl font-bold mb-8 text-white">Why Participate?</h3>

                            <div className="space-y-6">
                                {[
                                    { icon: Target, title: "Solve Real Problems", desc: "Tackle real-world challenges with innovative technological solutions.", color: "text-blue-400" },
                                    { icon: Rocket, title: "Learn & Grow", desc: "Push your limits. Learn new frameworks, tools, and languages under pressure.", color: "text-purple-400" },
                                    { icon: Trophy, title: "Win Big", desc: "Get rewarded for your hard work with huge prizes, swag, and recognition.", color: "text-pink-400" },
                                    { icon: Code2, title: "Network", desc: "Meet industry professionals, mentors, and fellow passionate developers.", color: "text-amber-400" }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-start group">
                                        <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-white/10 transition-colors`}>
                                            <item.icon className={`w-6 h-6 ${item.color}`} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-200 mb-1">{item.title}</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Floating elements behind card */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-10 -right-10 w-32 h-32 rounded-full border border-purple-500/20 flex items-center justify-center z-0"
                        >
                            <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Live Dashboard Button Section */}
                <div className="mt-24 max-w-7xl mx-auto w-full relative z-20">
                    <div className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border border-emerald-500/20 rounded-3xl p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center justify-between backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

                        <div className="mb-8 md:mb-0 relative z-10 md:pr-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-4 backdrop-blur-md">
                                <Timer className="w-4 h-4 text-emerald-400 animate-pulse" />
                                <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Event Tracker</span>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-white mb-2">Hackathon <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Live</span></h3>
                            <p className="text-gray-400 max-w-xl">Follow the real-time 24-hour countdown, track event schedules, view live announcements, and see shortlisted teams.</p>
                        </div>

                        <div className="relative z-10 shrink-0">
                            <Link href="/hackathon/live" className="group relative inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 hover:scale-105 transition-all outline-none focus:ring-4 focus:ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                                Enter Live Dashboard
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Shortlisted Teams Section */}
                {liveData?.shortlistedTeams && liveData.shortlistedTeams.length > 0 && (
                    <div className="mt-24 max-w-7xl mx-auto w-full relative z-20">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                                <Trophy className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black mb-4">
                                Shortlisted <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Teams</span>
                            </h2>
                            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                                Congratulations to the following teams who have been selected for the Grand Finale! 🎉
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {liveData.shortlistedTeams.map((team: any, i: number) => (
                                <motion.div
                                    key={team.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05, duration: 0.4 }}
                                    className="group p-5 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-cyan-900/10 border border-emerald-500/20 backdrop-blur-sm hover:border-emerald-400/40 hover:bg-emerald-900/30 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                                            <span className="text-emerald-400 font-bold text-sm">{i + 1}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-white text-lg truncate group-hover:text-emerald-300 transition-colors">{team.name}</h3>
                                            {team.idea_title && (
                                                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{team.idea_title}</p>
                                            )}
                                            {team.table_number && (
                                                <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md">
                                                    Table {team.table_number}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="text-center mt-8">
                            <p className="text-sm text-gray-500">
                                {liveData.shortlistedTeams.length} team{liveData.shortlistedTeams.length !== 1 ? 's' : ''} shortlisted for the Grand Finale
                            </p>
                        </div>
                    </div>
                )}

                {/* Why Sharda / Venue Highlights Section */}
                <div className="mt-32 max-w-7xl mx-auto w-full relative z-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6">
                            <Navigation className="w-8 h-8 text-blue-400" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Why Sharda University?</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">Experience the ultimate hacking environment built for endurance and innovation.</p>
                    </div>

                    <div className="grid lg:grid-cols-5 gap-12 items-center">
                        {/* Left Column: Selling Points */}
                        <div className="lg:col-span-2 space-y-6">
                            {[
                                { title: "Dedicated Hackathon Center", desc: "A massive, purpose-built space designed purely for 24-hr productivity and collaboration.", icon: Cpu, color: "text-purple-400", border: "border-purple-500/30" },
                                { title: "World-Class Infrastructure", desc: "High-speed Wi-Fi, ergonomic seating, secure networks, and uninterrupted power.", icon: Building2, color: "text-blue-400", border: "border-blue-500/30" },
                                { title: "Proven Legacy", desc: "We have flawlessly conducted six 24-hour hackathons till date with immense success.", icon: Timer, color: "text-emerald-400", border: "border-emerald-500/30" }
                            ].map((highlight, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.15 }}
                                    className={`p-6 bg-gradient-to-r from-white/5 to-transparent border-l-4 ${highlight.border} rounded-r-2xl backdrop-blur-sm group hover:bg-white/10 transition-colors`}
                                >
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className={`p-3 rounded-xl bg-black/40 border border-white/5 group-hover:scale-110 transition-transform`}>
                                            <highlight.icon className={`w-6 h-6 ${highlight.color}`} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white tracking-tight">{highlight.title}</h3>
                                    </div>
                                    <p className="text-gray-400 leading-relaxed pl-16">{highlight.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Right Column: Carousel */}
                        <div className="lg:col-span-3">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                            >
                                <VenueCarousel />
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Video Highlights Section */}
                <div className="mt-32 max-w-7xl mx-auto w-full relative z-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-6">
                            <Rocket className="w-8 h-8 text-orange-400" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-4">
                            Real Innovation, Not{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 line-through decoration-red-500/50">Imported Robo Dogs</span>
                        </h2>
                        <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-green-400 font-bold">
                                Sharda builds real innovators
                            </span>{' '}
                            who code, create, and compete — from scratch.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { id: "eQoYUPybySI", title: "Hackathon Highlights" },
                            { id: "84lYodGmy7c", title: "Innovation in Action" },
                            { id: "SCM0SXhth8o", title: "Building the Future" },
                            { id: "jP2_UlMBSTs", title: "24 Hours of Code" }
                        ].map((video, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group"
                            >
                                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-lg group-hover:border-purple-500/40 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300">
                                    <div className="aspect-[9/16]">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${video.id}`}
                                            title={video.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full"
                                            loading="lazy"
                                        />
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-400 mt-3 text-center group-hover:text-purple-400 transition-colors">{video.title}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <div className="mt-32 max-w-6xl mx-auto w-full relative z-20">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Contacts */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                            <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                <Users className="w-6 h-6 text-blue-400" /> Contact Details
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {[
                                    { name: "Dr. Sandeep Gupta", phone: "9717577497" },
                                    { name: "Dr. Ambuj Agarwal", phone: "9412246459" },
                                    { name: "Dr. Gaurav Raj", phone: "8587010020" },
                                    { name: "Ms. Harminder Kaur", phone: "9034664521" }
                                ].map((contact, i) => {
                                    const isRevealed = revealedContacts.includes(i);
                                    return (
                                        <div key={i} className="flex flex-col mb-2">
                                            <div className="text-sm text-gray-400 font-medium mb-1">{contact.name}</div>
                                            {isRevealed ? (
                                                <a href={`tel:+91${contact.phone}`} className="text-lg font-bold text-blue-400 hover:text-blue-300 transition-colors">
                                                    +91 {contact.phone}
                                                </a>
                                            ) : (
                                                <button
                                                    onClick={() => setRevealedContacts(prev => [...prev, i])}
                                                    className="text-left text-sm font-bold text-gray-500 hover:text-blue-400 transition-colors py-1 inline-flex items-center gap-2"
                                                >
                                                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">Click to Reveal Number</div>
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Payment & QR */}
                        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-3xl p-8 backdrop-blur-sm shadow-[0_0_30px_rgba(168,85,247,0.1)] text-center flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full point-events-none" />

                            <h3 className="text-2xl font-bold mb-2 text-white relative z-10">Registration Fee</h3>
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6 relative z-10">
                                INR 500 <span className="text-lg text-gray-400 font-medium">/ Per Team</span>
                            </div>

                            {/* QR Placeholder Grid */}
                            <div className="flex gap-8 items-center justify-center relative z-10">
                                <div className="text-center group cursor-pointer">
                                    <div className="w-32 h-32 bg-white rounded-xl mb-3 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-purple-500 transition-all shadow-lg">
                                        <img src="/images/payment-qr.png" alt="Payment QR" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-sm font-bold text-gray-300">Scan to Pay</div>
                                </div>

                                <div className="text-center group cursor-pointer">
                                    <div className="w-32 h-32 bg-white rounded-xl mb-3 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all shadow-lg">
                                        <img src="/images/registration-qr.png" alt="Registration QR" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-sm font-bold text-gray-300">Scan to Register</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tracks Section */}
                <div className="mt-32 max-w-6xl mx-auto w-full relative z-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Innovation Tracks</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Choose your battlefield. We are looking for groundbreaking solutions across these key domains.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {[
                            {
                                title: "Track 1: AI and Intelligent Systems",
                                icon: HeartPulse,
                                color: "text-rose-400", border: "border-rose-500/20", bg: "bg-rose-500/5", glow: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.1)]",
                                desc: "This track emphasizes the design and development of intelligent, adaptive, and autonomous systems using Artificial Intelligence to solve complex real-world problems. Participants are encouraged to leverage machine learning, deep learning, NLP, computer vision, and intelligent automation to enhance efficiency, inclusivity, and decision-making.",
                                problem: "AI-Driven Solutions for Smart and Inclusive India",
                                subtracks: ["AI for Healthcare & Well-Being", "AI for Education & Skill Development", "AI for Agriculture & Rural Development", "AI for Smart Cities & Governance"],
                                challenge: ["Automates or optimizes real-world processes.", "Uses machine learning, NLP, computer vision, or intelligent agent", "Supports inclusivity through regional languages and adaptive interfaces", "Provides predictive or recommendation-based outcomes"],
                                outcome: "An AI-powered prototype that improves efficiency, accessibility, or service quality, contributing to SDG 3, SDG 4, SDG 9, and SDG 10, and supporting the Viksit Bharat @2047 vision"
                            },
                            {
                                title: "Track 2: Web, App and Software Innovation",
                                icon: BookOpen,
                                color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/5", glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]",
                                desc: "This track focuses on end-to-end software development, including web platforms, mobile applications, and enterprise systems that address real-world challenges through scalable, secure, and user-centric digital solutions.",
                                problem: "Digital Platforms for Next-Generation Bharat",
                                subtracks: ["Citizen-Centric Digital Platforms", "EdTech, Health Tech & Fin Tech Solutions", "Startup & MSME Enablement Software", "Cloud-Native and SaaS Applications"],
                                challenge: ["Solves a real-world problem in governance, education, healthcare, business, or public utilities.", "Ensures seamless UI/UX with multilingual support.", "Integrates APIs, cloud services, or microservices.", "Is scalable, secure, and user-centric."],
                                outcome: "A robust digital application that enhances service delivery, productivity, or citizen engagement, aligned with SDG 9, SDG 11, and SDG 16."
                            },
                            {
                                title: "Track 3: Cybersecurity and Blockchain",
                                icon: ShieldAlert,
                                color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/5", glow: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]",
                                desc: "This track addresses the need for secure, transparent, and resilient digital ecosystems. Participants will explore cyber defense mechanisms, cryptography, privacy preservation, and blockchain-based trust systems.",
                                problem: "Secure, Transparent and Trusted Digital Ecosystems",
                                subtracks: ["Cyber Threat Detection & Prevention", "Data Privacy and Digital Identity", "Blockchain for Governance & Public Records", "Blockchain for Finance & Supply Chain"],
                                challenge: ["Protects digital systems from cyber threats.", "Ensures data integrity, privacy, and authentication", "Uses blockchain for secure records, smart contracts, or decentralized systems.", "Enhances trust in digital transactions and public services."],
                                outcome: "A secure and resilient digital framework or prototype supporting SDG 9 and SDG 16, strengthening India’s digital trust ecosystem."
                            },
                            {
                                title: "Track 4: Data Science and Smart Analytics",
                                icon: LineChart,
                                color: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/5", glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]",
                                desc: "This track encourages participants to transform raw data into actionable insights using data science, analytics, visualization, and predictive modeling to support sustainable development and strategic decision-making.",
                                problem: "Data-Driven Insights for Sustainable and Smart Bharat",
                                subtracks: ["Urban & Infrastructure Analytics", "Economic & Policy Analytics", "Environmental & Climate Analytics", "Business Intelligence & Decision Support"],
                                challenge: ["Collects, cleans, and analyzes structured or unstructured data.", "Applies statistical models, predictive analytics, or visualization techniques.", "Provides actionable insights for decision-makers.", "Addresses challenges in sustainability, urban development, economy, or public welfare."],
                                outcome: "A smart analytics platform that supports evidence-based decision-making and sustainable development, aligned with SDG 8, SDG 11, SDG 12, and SDG 13"
                            },
                            {
                                title: "Track 5: Social Impact and Smart India Solutions",
                                icon: Globe,
                                color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5", glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]",
                                desc: "This track focuses on technology-driven social innovation that addresses grassroots challenges and supports inclusive, ethical, and sustainable development.",
                                problem: "Technology for Inclusive Growth and Social Transformation",
                                subtracks: ["Rural Development & Digital Inclusion", "Women Empowerment & Child Welfare", "Waste Management & Environmental Protection", "Assistive Technologies & Accessibility"],
                                challenge: ["Solves a pressing social or community problem.", "Uses CSE tools such as apps, AI, IoT, or data platforms.", "Is cost-effective, easy to adopt, and scalable.", "Demonstrates measurable social impact."],
                                outcome: "A socially impactful solution that promotes inclusive development and community empowerment, contributing to SDG 1, SDG 5, SDG 10, and SDG 17, and supporting the Smart India & Viksit Bharat vision"
                            },
                            {
                                title: "Track 6: School Student Innovation (SCHI)",
                                icon: GraduationCap,
                                color: "text-orange-400", border: "border-orange-500/20", bg: "bg-orange-500/5", glow: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]",
                                desc: "This track aims to foster creativity and problem-solving skills among school students. Young innovators are encouraged to build out-of-the-box prototypes and solutions addressing everyday problems, demonstrating the power of early-stage STEM education.",
                                problem: "Empowering Young Minds for Everyday Solutions",
                                subtracks: ["Smart School & Education Aids", "Eco-friendly & Green Innovations", "Everyday Problem Solving", "Basic Automation & IoT"],
                                challenge: ["Identifies a relatable everyday problem.", "Proposes a creative, functional solution or prototype.", "Uses basic technology, coding, or electronics.", "Demonstrates original thinking and practical application."],
                                outcome: "A functional prototype, app, or concept model built by school students that solves a practical problem, promoting STEM learning and SDG 4."
                            }
                        ].map((track, i) => {
                            const isActive = activeTrack === i;

                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className={`p-6 md:p-8 rounded-3xl border ${track.border} ${isActive ? track.bg : 'bg-black/40'} backdrop-blur-sm group relative overflow-hidden shadow-lg ${isActive ? track.glow : 'hover:bg-white/5'} transition-all cursor-pointer`}
                                    onClick={() => setActiveTrack(isActive ? null : i)}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Header & Toggle */}
                                    <div className="flex items-center justify-between gap-4 relative z-10 w-full">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-black/50 border border-white/5 flex items-center justify-center shrink-0`}>
                                                <track.icon className={`w-6 h-6 md:w-7 md:h-7 ${track.color}`} />
                                            </div>
                                            <h3 className={`text-xl md:text-3xl font-black ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white transition-colors'}`}>{track.title}</h3>
                                        </div>
                                        <div className={`p-2 rounded-full bg-white/5 border border-white/10 shrink-0 transition-transform duration-300 ${isActive ? 'rotate-90 bg-white/20' : ''}`}>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>

                                    {/* Description (Always visible, but changes color) */}
                                    <p className={`mt-4 leading-relaxed text-sm md:text-lg relative z-10 ${isActive ? 'text-gray-300 mb-8' : 'text-gray-500 line-clamp-2 md:line-clamp-none group-hover:text-gray-400 transition-colors'}`}>
                                        {track.desc}
                                    </p>

                                    {isActive && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="grid md:grid-cols-2 gap-8 relative z-10 pt-4 border-t border-white/10"
                                        >
                                            {/* Left Column */}
                                            <div className="space-y-6">
                                                <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                                                    <div className="text-xs font-bold uppercase tracking-widest text-[#a1a1aa] mb-2">Problem Statement</div>
                                                    <div className={`font-bold text-lg ${track.color}`}>{track.problem}</div>
                                                </div>

                                                <div>
                                                    <div className="text-xs font-bold uppercase tracking-widest text-[#a1a1aa] mb-4 flex items-center gap-2"><ArrowLeft className="w-3 h-3 rotate-180" /> Sub-Tracks</div>
                                                    <ul className="space-y-3">
                                                        {track.subtracks.map((sub, j) => (
                                                            <li key={j} className="flex items-start gap-3 text-gray-300">
                                                                <div className={`w-1.5 h-1.5 rounded-full mt-2 bg-current ${track.color}`} />
                                                                <span className="leading-snug">{sub}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Right Column */}
                                            <div className="space-y-6">
                                                <div>
                                                    <div className="text-xs font-bold uppercase tracking-widest text-[#a1a1aa] mb-4 flex items-center gap-2"><Target className="w-3 h-3" /> Challenge Requirements</div>
                                                    <ul className="space-y-3">
                                                        {track.challenge.map((c, j) => (
                                                            <li key={j} className="flex items-start gap-3 justify-start bg-black/20 p-3 rounded-xl border border-white/5">
                                                                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${track.color}`} />
                                                                <span className="text-sm text-gray-300 leading-relaxed">{c}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className={`border-l-2 bg-gradient-to-r from-white/5 to-transparent rounded-r-2xl p-5 ${track.color}`} style={{ borderLeftColor: 'currentColor' }}>
                                                    <div className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Expected Outcome</div>
                                                    <div className="text-sm text-white font-medium leading-relaxed">{track.outcome}</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Aesthetic Line */}
                                    <div className={`absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 group-hover:w-full transition-all duration-700 ${track.color}`} />
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* Sponsors Section */}
                <div className="mt-32 max-w-6xl mx-auto w-full relative z-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Our Sponsors & Partners</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Backed by industry leaders who believe in fostering innovation and empowering the next generation of creators.</p>
                    </div>

                    {/* Current Sponsors */}
                    <div className="flex flex-wrap justify-center gap-8 mb-16">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col items-center justify-center min-w-[280px] backdrop-blur-sm hover:bg-white/10 transition-colors group">
                            <div className="text-xs font-bold uppercase tracking-widest text-[#a1a1aa] mb-4">Title Sponsor</div>
                            <div className="bg-white rounded-2xl p-4 mb-4 group-hover:scale-105 transition-transform">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/images/chings-secret-logo.jpg" alt="Ching's Secret" className="h-24 w-auto object-contain" />
                            </div>
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 tracking-wider text-center">Ching&apos;s Secret</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col items-center justify-center min-w-[280px] backdrop-blur-sm hover:bg-white/10 transition-colors group">
                            <div className="text-xs font-bold uppercase tracking-widest text-[#a1a1aa] mb-4">Associate Sponsor</div>
                            <div className="bg-white rounded-2xl p-4 mb-4 group-hover:scale-105 transition-transform">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/images/prismatix-logo.jpg" alt="Prismatix" className="h-24 w-auto object-contain" />
                            </div>
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 tracking-wider text-center uppercase">PRISMATIX</span>
                        </div>
                    </div>

                    {/* Become a Sponsor */}
                    <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-3xl p-8 md:p-12 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                        <div className="text-center mb-10 relative z-10">
                            <h3 className="text-3xl font-bold text-white mb-4">Become a Sponsor</h3>
                            <p className="text-gray-400 max-w-2xl mx-auto">Elevate your brand and connect with top tech talent. Choose a sponsorship tier that aligns with your goals.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                            {/* Gold Tier */}
                            <div className="bg-gradient-to-b from-yellow-500/10 to-transparent border border-yellow-500/30 p-6 rounded-2xl relative transform lg:-translate-y-4 shadow-2xl">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Premium</div>
                                <h4 className="text-xl font-bold text-yellow-400 mb-2 mt-2">Gold Sponsor</h4>
                                <div className="text-3xl font-black text-white mb-4">₹1.25 L<span className="text-lg text-yellow-500/50">akhs</span></div>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" /> Prominent Logo Placement</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" /> Keynote Speaking Slot</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" /> Dedicated Booth Area</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" /> Access to Resumes</li>
                                </ul>
                                <a href="mailto:ambuj.agarwal@sharda.ac.in?subject=Gold Sponsorship Inquiry" className="block text-center w-full py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-bold rounded-xl transition-colors border border-yellow-500/50 mt-auto">Inquire Now</a>
                            </div>

                            {/* Silver Tier */}
                            <div className="bg-gradient-to-b from-slate-300/10 to-transparent border border-slate-400/30 p-6 rounded-2xl flex flex-col h-full">
                                <h4 className="text-xl font-bold text-slate-300 mb-2">Silver Sponsor</h4>
                                <div className="text-3xl font-black text-white mb-4">₹50,000</div>
                                <ul className="space-y-3 mb-6 flex-1">
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" /> Logo on Banners & Website</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" /> Distribute Merch/Flyers</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" /> Mention in PR & Media</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" /> Recruitment Support</li>
                                </ul>
                                <a href="mailto:ambuj.agarwal@sharda.ac.in?subject=Silver Sponsorship Inquiry" className="block text-center w-full py-2 bg-slate-500/20 hover:bg-slate-500/30 text-slate-300 font-bold rounded-xl transition-colors border border-slate-400/50 mt-auto">Inquire Now</a>
                            </div>

                            {/* Bronze Tier */}
                            <div className="bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/30 p-6 rounded-2xl flex flex-col h-full">
                                <h4 className="text-xl font-bold text-orange-400 mb-2">Bronze Sponsor</h4>
                                <div className="text-3xl font-black text-white mb-4">₹25,000</div>
                                <ul className="space-y-3 mb-6 flex-1">
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" /> Logo on Website</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" /> Social Media Shoutout</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" /> Certificate of Appreciation</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" /> Special Mentions during Event</li>
                                </ul>
                                <a href="mailto:ambuj.agarwal@sharda.ac.in?subject=Bronze Sponsorship Inquiry" className="block text-center w-full py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-bold rounded-xl transition-colors border border-orange-500/50 mt-auto">Inquire Now</a>
                            </div>

                            {/* Custom Tier */}
                            <div className="bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/30 p-6 rounded-2xl flex flex-col h-full bg-black/40 border-dashed backdrop-blur-md">
                                <h4 className="text-xl font-bold text-purple-400 mb-2">Custom Partner</h4>
                                <div className="text-2xl font-black text-white mb-4 italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Let's Discuss</div>
                                <ul className="space-y-3 mb-6 flex-1 opacity-80">
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> API Sponsor & Bounties</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Workshop Organization</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> In-kind Media & Food</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Hardware Provision</li>
                                </ul>
                                <a href="mailto:ambuj.agarwal@sharda.ac.in?subject=Custom Sponsorship Inquiry" className="block text-center w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-bold rounded-xl transition-colors border border-purple-500/50 mt-auto">Get in Touch</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prize Pool Section */}
                <div className="mt-32 max-w-6xl mx-auto w-full relative z-20">
                    <div className="text-center mb-16 relative">
                        <div className="absolute inset-0 bg-yellow-500/10 blur-[100px] rounded-full w-1/2 mx-auto" />
                        <div className="inline-block relative z-10">
                            <motion.h2
                                initial={{ scale: 0.9, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 100 }}
                                className="text-6xl md:text-8xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-600 drop-shadow-[0_0_25px_rgba(250,204,21,0.4)] tracking-tight"
                            >
                                ₹2.05 LAKHS
                            </motion.h2>
                            <div className="absolute -top-8 -right-12 animate-bounce-slow">
                                <IndianRupee className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
                            </div>
                        </div>
                        <p className="text-2xl text-yellow-500/90 uppercase tracking-[0.3em] font-bold mt-4">Total Prize Pool</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-end mb-12">
                        {/* 2nd Place */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                            className="order-2 md:order-1 relative p-1 rounded-3xl bg-gradient-to-b from-gray-300 to-gray-600"
                        >
                            <div className="bg-black/90 p-8 rounded-[22px] h-full text-center relative overflow-hidden">
                                <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h4 className="text-xl font-bold text-gray-400 mb-2">1st Runner Up</h4>
                                <div className="text-5xl font-black text-white mb-2">₹50K</div>
                                <div className="text-gray-500 text-sm uppercase tracking-widest">+ Goodies</div>
                            </div>
                        </motion.div>

                        {/* 1st Place */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="order-1 md:order-2 relative p-1 rounded-3xl bg-gradient-to-b from-yellow-300 via-amber-500 to-yellow-700 shadow-[0_0_40px_rgba(245,158,11,0.3)] z-10 scale-105"
                        >
                            <div className="bg-black p-8 rounded-[22px] h-full text-center relative overflow-hidden">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[100px] bg-yellow-500/20 blur-2xl rounded-full" />
                                <Trophy className="w-24 h-24 mx-auto mb-4 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                                <h4 className="text-2xl font-bold text-yellow-500 mb-2 uppercase tracking-wide">Grand Prize</h4>
                                <div className="text-6xl font-black text-white mb-2">₹1 Lakh</div>
                                <div className="text-yellow-500 text-sm uppercase tracking-widest">+ Premium Goodies</div>
                            </div>
                        </motion.div>

                        {/* 3rd Place */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                            className="order-3 relative p-1 rounded-3xl bg-gradient-to-b from-orange-400 to-orange-800"
                        >
                            <div className="bg-black/90 p-8 rounded-[22px] h-full text-center relative overflow-hidden">
                                <Star className="w-16 h-16 mx-auto mb-4 text-orange-400" />
                                <h4 className="text-xl font-bold text-orange-400/80 mb-2">2nd Runner Up</h4>
                                <div className="text-5xl font-black text-white mb-2">₹25K</div>
                                <div className="text-orange-500/50 text-sm uppercase tracking-widest">+ Goodies</div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="text-center p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm max-w-2xl mx-auto">
                        <h4 className="text-xl font-bold text-purple-400 mb-2">Track Winners</h4>
                        <p className="text-gray-300">₹5,000 for top performing team in each of the 5 tracks!</p>
                    </div>
                </div>


                {/* Timeline - Full Width Alternating */}
                <div className="mt-32 max-w-5xl mx-auto w-full relative z-20">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                <CalendarDays className="w-6 h-6 text-blue-400" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Timeline & Progress</h2>
                        </div>

                        {nextEventInfo && (
                            <div className="inline-block px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl">
                                <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Status Update</div>
                                <div className={`text-sm md:text-base font-bold font-mono tracking-tight ${nextEventInfo.color}`}>
                                    {'> '}{nextEventInfo.text}
                                </div>
                            </div>
                        )}
                    </div>

                    {currentDate && (
                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500/50 via-purple-500/30 to-transparent -translate-x-[1px]" />

                            <div className="space-y-12">
                                {timelineEvents.map((event, i) => {
                                    const eventDate = event.timestamp;
                                    const isPast = currentDate.getTime() > eventDate;
                                    const isNext = timelineEvents.findIndex(e => currentDate.getTime() <= e.timestamp) === i;
                                    const isLeft = i % 2 === 0;

                                    return (
                                        <div key={i} className={`relative flex items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row group`}>

                                            {/* Center Dot */}
                                            <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 z-10 bg-[#050505] p-1">
                                                {isPast ? (
                                                    <div className="w-full h-full rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                                ) : isNext ? (
                                                    <div className="w-full h-full rounded-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,1)] animate-pulse" />
                                                ) : (
                                                    <div className="w-full h-full rounded-full bg-gray-600" />
                                                )}
                                            </div>

                                            {/* Content Card */}
                                            <div className={`w-full md:w-[45%] ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'} pl-16 md:pl-12`}>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    whileHover={{ scale: 1.02 }}
                                                    className={`p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 ${isNext
                                                        ? 'bg-purple-500/10 border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
                                                        : isPast
                                                            ? 'bg-blue-500/5 border-blue-500/20'
                                                            : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100'
                                                        }`}
                                                >
                                                    <div className={`text-sm font-bold tracking-widest uppercase mb-2 ${isPast ? 'text-gray-400' : isNext ? 'text-purple-400' : 'text-gray-500'} ${isLeft ? 'md:justify-end' : ''} flex items-center gap-2`}>
                                                        <Clock className="w-4 h-4" />
                                                        {event.date}
                                                    </div>
                                                    <h3 className={`text-2xl font-bold ${isNext ? 'text-white' : 'text-gray-300'}`}>
                                                        {event.title}
                                                    </h3>
                                                </motion.div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Guidelines & Facilities */}
                <div className="mt-32 max-w-6xl mx-auto w-full relative z-20">
                    <div className="grid md:grid-cols-2 gap-8">

                        {/* Left: Guidelines */}
                        <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden h-full">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full" />
                            <div className="flex items-center gap-4 mb-8 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                    <ListChecks className="w-6 h-6 text-purple-400" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Student Guidelines (Must Follow)</h2>
                            </div>
                            <ul className="space-y-4 relative z-10">
                                {[
                                    "All participants must remain inside the campus for the full 24-hour duration.",
                                    "At least one team member must be present at the project desk at all times.",
                                    "Students are not allowed to leave the venue except in case of emergency.",
                                    "Participants may take short nap breaks in the designated rest area.",
                                    "Misconduct, indiscipline, or violation of rules may lead to disqualification."
                                ].map((rule, i) => (
                                    <li key={i} className="flex items-start gap-4 p-4 rounded-xl bg-black/40 border border-white/5 hover:border-purple-500/40 hover:bg-white/10 transition-all duration-300 group">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 font-bold text-sm border border-purple-500/30 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(168,85,247,0.6)] transition-all">{i + 1}</div>
                                        <span className="text-gray-300 leading-relaxed text-sm">{rule}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right: Facilities */}
                        <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden h-full">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full" />
                            <div className="flex items-center gap-4 mb-8 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                    <ShieldAlert className="w-6 h-6 text-blue-400" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Facilities Provided to Participants</h2>
                            </div>
                            <ul className="space-y-4 relative z-10">
                                {[
                                    "3-time meals during the hackathon.",
                                    "Hostel stay facility for participants from outside the campus.",
                                    "Snacks, tea/coffee will be available at intervals.",
                                    "Resting/Nap room arrangements.",
                                    "Participation certificate for all shortlisted finale teams."
                                ].map((facility, i) => (
                                    <li key={i} className="flex items-start gap-4 p-4 rounded-xl bg-black/40 border border-white/5 hover:border-blue-500/40 hover:bg-white/10 transition-all duration-300 group">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-sm border border-blue-500/30 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <span className="text-gray-300 leading-relaxed text-sm">{facility}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </div>

                {/* Map & Logistics Section */}
                <div className="mt-32 max-w-6xl mx-auto w-full relative z-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Venue & Accessibility</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Reaching Sharda University, Greater Noida is simple. Plan your transit.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                        {/* Interactive Google Map embed */}
                        <div className="lg:col-span-2 bg-white/5 border border-white/10 p-2 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                            <iframe
                                src="https://maps.google.com/maps?q=Sharda%20University,%20Greater%20Noida&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="450"
                                className="rounded-2xl w-full border-0 filter invert-[90%] hue-rotate-180 contrast-[1.2]"
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>

                        {/* Travel Connectivity */}
                        <div className="space-y-4">
                            {[
                                { route: "By Metro", desc: "Nearest Stations: Knowledge Park II & Pari Chowk (Aqua Line). E-rickshaws available to campus from both stations.", icon: TrainFront, color: "text-blue-400", border: "border-blue-500/30" },
                                { route: "By Air", desc: "IGI Airport New Delhi is ~1.5 Hrs away via Noida-Greater Noida Expressway.", icon: Plane, color: "text-purple-400", border: "border-purple-500/30" },
                                { route: "By Rail", desc: "New Delhi Railway Station (NDLS) is well connected via Metro (Yellow -> Blue -> Aqua line).", icon: Train, color: "text-emerald-400", border: "border-emerald-500/30" }
                            ].map((transit, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 5 }}
                                    className={`p-6 bg-black/40 border-l-4 ${transit.border} border-y border-r border-y-white/5 border-r-white/5 rounded-r-2xl backdrop-blur-sm`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <transit.icon className={`w-5 h-5 ${transit.color}`} />
                                        <h4 className="font-bold text-lg text-white">{transit.route}</h4>
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed">{transit.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>



                {/* FAQ Section */}
                <div className="mt-32 max-w-4xl mx-auto w-full relative z-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4">Frequently Asked Questions</h2>
                        <p className="text-gray-400">Everything you need to know about the Hackathon.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: "Who can participate?", a: "Students of B.Tech and all bachelor degree programs." },
                            { q: "Can we form teams with students from other colleges or departments?", a: "Cross colleges team is not allowed, but cross departments are allowed and other department students can participate also." },
                            { q: "Can a student be part of multiple teams?", a: "A student can be part of 2 teams, but if more than one of their teams is selected for the final offline round, the student must choose only one team to represent." },
                            { q: "What is the team size?", a: "2–5 members recommended." },
                            { q: "Is the hackathon online or offline?", a: "The Grand Finale is fully on-site (offline) at Sharda University." },
                            { q: "What is the evaluation basis?", a: "Innovation, feasibility, technical depth, impact, and demonstration quality." },
                            { q: "Will Wi-Fi be provided?", a: "Yes, Wi-Fi access will be arranged, though teams may use personal hotspots." },
                            { q: "What should teams bring?", a: "Laptops, chargers, stationery, ID cards, and personal essentials." },
                            { q: "Will accommodation be provided?", a: "Yes. Hostel accommodation will be provided to needful participants arriving the night before the hackathon." }
                        ].map((faq, i) => (
                            <details key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group cursor-pointer [&_summary::-webkit-details-marker]:hidden">
                                <summary className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors flex items-center justify-between list-none">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                                        {faq.q}
                                    </div>
                                    <span className="text-purple-500/50 transition-transform group-open:rotate-180">▼</span>
                                </summary>
                                <p className="text-gray-400 mt-4 pl-5 border-l-2 border-purple-500/30 line-relaxed">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>


            </div>
        </div>
    )
}
