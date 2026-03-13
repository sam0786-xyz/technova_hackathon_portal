"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Dynamic slides mixing real images and feedback statistics
const SLIDES = [
    {
        id: 1,
        type: 'image',
        url: "/images/hackathon-venue/hackathon-center.JPEG",
        title: "Dedicated Hackathon Center",
        desc: "A sprawling setup optimized for 24-hr productivity and collaboration."
    },
    {
        id: 2,
        type: 'stat',
        statValue: "4.31/5",
        statLabel: "Average Rating",
        title: "Stellar Participant Experience",
        desc: "Based on 400+ detailed post-event feedback responses."
    },
    {
        id: 3,
        type: 'stat',
        statValue: "4.33/5",
        statLabel: "Event Organization",
        title: "Flawless Execution",
        desc: "Rated highly for seamless management and 24-hour support."
    },
    {
        id: 4,
        type: 'stat',
        statValue: "4.26/5",
        statLabel: "Facilities & Venue",
        title: "World-Class Infrastructure",
        desc: "Equipped with high-speed Wi-Fi, ergonomic seating, and uninterrupted power."
    },
    {
        id: 5,
        type: 'stat',
        statValue: "4.23/5",
        statLabel: "Technical & Mentor Support",
        title: "Expert Guidance",
        desc: "Dedicated mentors and technical experts available around the clock to assist teams."
    }
]

export function VenueCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length)
    }, [])

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
    }

    // Auto-play logic
    useEffect(() => {
        if (!isAutoPlaying) return

        const interval = setInterval(nextSlide, 5000)
        return () => clearInterval(interval)
    }, [isAutoPlaying, nextSlide])

    return (
        <div
            className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden group border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                >
                    {SLIDES[currentIndex].type === 'image' ? (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10" />
                            <img
                                src={SLIDES[currentIndex].url}
                                alt={SLIDES[currentIndex].title}
                                className="w-full h-full object-cover"
                            />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-[#050505] z-10 flex flex-col items-center justify-center p-8 text-center pt-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />

                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-2"
                            >
                                {SLIDES[currentIndex].statValue}
                            </motion.div>
                            <div className="text-xl md:text-2xl font-bold text-purple-400 uppercase tracking-[0.2em] mb-16">
                                {SLIDES[currentIndex].statLabel}
                            </div>
                        </div>
                    )}

                    <div className={`absolute bottom-0 left-0 w-full p-8 md:p-12 z-20 ${SLIDES[currentIndex].type === 'stat' ? 'text-center flex flex-col items-center' : ''}`}>
                        <motion.h3
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-2xl md:text-4xl font-black text-white mb-2 drop-shadow-lg"
                        >
                            {SLIDES[currentIndex].title}
                        </motion.h3>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className={`text-gray-300 md:text-lg max-w-xl drop-shadow-md ${SLIDES[currentIndex].type === 'stat' ? 'mx-auto' : ''}`}
                        >
                            {SLIDES[currentIndex].desc}
                        </motion.p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Pagination Indicators */}
            <div className="absolute bottom-6 right-8 z-30 flex gap-2">
                {SLIDES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`transition-all duration-300 rounded-full h-2 ${currentIndex === idx ? 'w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                    />
                ))}
            </div>
        </div>
    )
}
