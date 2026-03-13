'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Calendar, MapPin, Clock, ExternalLink, Zap, Cloud, Database, Sparkles, Terminal, Timer } from 'lucide-react'
import { useState, useEffect } from 'react'

const events = [
    {
        id: "innovate-bharat",
        title: (
            <>
                INNOVATE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-green-500 font-extrabold tracking-widest px-1">BHARAT</span> HACKATHON 2026
            </>
        ),
        subtitle: "Innovating Today for a Sustainable Tomorrow",
        date: "April 10-11, 2026",
        time: "24 Hours",
        location: "Block 45, Sharda University",
        description: "A 24-hour National Level Hackathon designed to inspire innovation and real-world problem solving. Compete for a massive prize pool of ₹2,00,000 across themes like AI, Web3, Cybersecurity, and Smart India Solutions.",
        link: "/hackathon",
        code: null,
        tags: ["Hackathon", "₹2,00,000 Prize", "AI & Web3"],
        icon: Terminal,
        color: "blue",
        gradient: "from-blue-600/30 via-blue-600/10 to-transparent",
        border: "border-blue-500/30 group-hover:border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
        iconBg: "bg-blue-500/20 text-blue-400",
        deadline: "2026-03-14T23:59:59+05:30",
        deadlineText: "14th March 2026",
        isHighlight: true
    },
    {
        id: "aws-community-day",
        title: "AWS Cloud Club Student Community Day",
        subtitle: "Delhi NCR’s Biggest Community-Led Tech Summit",
        date: "March 27, 2026",
        time: "Full Day",
        location: "Delhi-NCR",
        description: "Join innovators, builders, founders, and cloud enthusiasts for a full-day experience packed with Real-world cloud & AI sessions, industry speakers, hands-on learning, and networking with 1000+ students & professionals.",
        link: "https://register.awscc.dev",
        code: "HOLI60",
        tags: ["Cloud", "AI", "DevOps"],
        icon: Cloud,
        color: "orange",
        gradient: "from-orange-500/20 via-orange-500/5 to-transparent",
        border: "group-hover:border-orange-500/50",
        iconBg: "bg-orange-500/20 text-orange-400",
        deadline: "2026-03-27T00:00:00+05:30",
        deadlineText: "27th March 2026",
        closingSoon: true
    }
]

export function FeaturedEvents() {
    const [currentTime, setCurrentTime] = useState<Date | null>(null)

    useEffect(() => {
        setCurrentTime(new Date())
        const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 60)
        return () => clearInterval(timer)
    }, [])

    const getDaysLeft = (deadline: string) => {
        if (!currentTime) return null
        const diff = new Date(deadline).getTime() - currentTime.getTime()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
        return days > 0 ? days : 0
    }

    return (
        <section className="relative py-24 overflow-hidden bg-black border-y border-white/5">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1)_0,transparent_70%)] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 mb-6 backdrop-blur-md"
                    >
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 font-bold uppercase tracking-widest text-sm">Flagship Events</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black tracking-tight mb-6"
                    >
                        Don't Miss Out On These <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                            Upcoming Experiences
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-lg"
                    >
                        Whether you are into Cloud, Data, or building crazy projects overnight. We have something for everyone.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {events.map((event, index) => {
                        const daysLeft = getDaysLeft(event.deadline)

                        return (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15, duration: 0.6 }}
                                className="group relative h-full"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${event.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                <div className={`relative h-full flex flex-col p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border ${event.border ? event.border : 'border-white/10 group-hover:border-white/30'} transition-all duration-500 hover:-translate-y-2 overflow-hidden`}>

                                    {/* Highlight Banner for special events */}
                                    {event.isHighlight && (
                                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400 via-white to-green-500" />
                                    )}

                                    {/* Top portion */}
                                    <div className="mb-6 flex-grow">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`w-14 h-14 rounded-2xl ${event.iconBg} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg`}>
                                                <event.icon className="w-7 h-7" />
                                            </div>

                                            {/* Days Left Badge */}
                                            {daysLeft !== null && (
                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${daysLeft <= 5 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'} text-xs font-bold shadow-sm backdrop-blur-md`}>
                                                    <Timer className="w-3.5 h-3.5" />
                                                    {daysLeft === 0 ? 'Last Day!' : `${daysLeft} Days Left`}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {event.tags.map((tag, i) => (
                                                <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300 font-medium">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-colors">
                                            {event.title}
                                        </h3>
                                        <p className="text-sm font-semibold text-gray-300 mb-4 whitespace-pre-line tracking-wide">
                                            {event.subtitle}
                                        </p>
                                        <p className="text-sm text-gray-400 leading-relaxed mb-6 line-clamp-4">
                                            {event.description}
                                        </p>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-3 text-gray-300 text-sm">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span>{event.date}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-300 text-sm">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <span>{event.time}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-300 text-sm">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <span>{event.location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-3">

                                        {/* Highlight Registration Deadline Text */}
                                        {event.isHighlight && (
                                            <div className="mb-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center animate-pulse">
                                                <p className="text-xs text-orange-400 font-bold uppercase tracking-wider">
                                                    🚨 Last Date To Register: {event.deadlineText}
                                                </p>
                                            </div>
                                        )}

                                        {event.closingSoon && (
                                            <div className="mb-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center animate-pulse">
                                                <p className="text-xs text-red-400 font-bold uppercase tracking-wider">
                                                    ⏳ Registrations Closing Soon
                                                </p>
                                            </div>
                                        )}

                                        {event.code && (
                                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                                                <span className="text-xs text-gray-400 font-medium">Use Code:</span>
                                                <span className="text-sm font-bold text-white tracking-wider font-mono bg-white/10 px-2 py-1 rounded-md">
                                                    {event.code}
                                                </span>
                                            </div>
                                        )}
                                        <Link href={event.link} target={event.link.startsWith('http') ? "_blank" : undefined} rel={event.link.startsWith('http') ? "noopener noreferrer" : undefined} className="block w-full">
                                            <button className={`w-full py-4 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${event.isHighlight ? 'bg-gradient-to-r from-orange-500 via-white to-green-500 text-black hover:opacity-90 shadow-[0_0_20px_rgba(255,165,0,0.4)]' : 'bg-white text-black hover:bg-gray-200 shadow-lg'} group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]`}>
                                                <span>{event.isHighlight ? 'Register Now' : (event.link === '/hackathon' ? 'Learn More' : 'Register Now')}</span>
                                                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
