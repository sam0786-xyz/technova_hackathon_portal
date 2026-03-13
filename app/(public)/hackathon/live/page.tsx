'use client'

import { useEffect, useState } from 'react'
import LiveDashboardClient from '@/app/(public)/live/live-dashboard'
import { motion } from 'framer-motion'
import { Terminal } from 'lucide-react'

export default function HackathonLivePage() {
    const [liveData, setLiveData] = useState<{ settings: any; schedule: any[]; shortlistedTeams: any[] } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
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
                    <div className="text-xl mb-2 font-bold tracking-widest text-green-400 shadow-green-500/50 drop-shadow-md">INITIALIZING LIVE_FEED</div>
                    <div className="text-xs text-green-600 mb-8 tracking-[0.3em]">HACKATHON_PROTOCOL_LIVE</div>

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
                </motion.div>
            </div>
        )
    }

    if (!liveData) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-mono">Loading Live Data...</div>

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-32 selection:bg-purple-500/30 relative overflow-hidden">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-purple-900/10 rounded-full blur-[150px] opacity-70 translate-x-1/2 -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[150px] opacity-40 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4">
                <LiveDashboardClient
                    initialSettings={liveData.settings || null}
                    initialSchedule={liveData.schedule || []}
                    initialShortlisted={liveData.shortlistedTeams || []}
                />
            </div>
        </div>
    )
}
