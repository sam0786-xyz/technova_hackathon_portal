'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

const clubs = [
    {
        name: "AI & Robotics",
        slug: "ai-robotics",
        logo: "/assets/logo/AI_&_Robotics_logo.png",
        desc: "Innovating the future with Intelligence. Exploring AI, Machine Learning, and Robotics.",
    },
    {
        name: "AWS Cloud",
        slug: "aws-cloud",
        logo: "/assets/logo/awscc.png",
        desc: "Building on the Cloud, for the World. Mastering AWS services and serverless architecture.",
    },
    {
        name: "CyberPirates",
        slug: "cyber-pirates",
        logo: "/assets/logo/cyberpirates.png",
        desc: "Guide individuals about Information security and cyber awareness to arm against modern exploits.",
    },
    {
        name: "Datapool",
        slug: "datapool",
        logo: "/assets/logo/datapool.png",
        desc: "Focusing on data insights, Database Management Systems, and languages like MySQL.",
    },
    {
        name: "Game Drifters",
        slug: "game-drifters",
        logo: "/assets/logo/Game Drifters.png",
        desc: "A community for exploring and developing new games. Connect, share, and build.",
    },
    {
        name: "GDG on Campus",
        slug: "gdg",
        logo: "/assets/logo/gdg_on_campus.jpg",
        desc: "Google Developer Group. Peer-to-peer learning to build solutions for local communities.",
    },
    {
        name: "GitHub Club",
        slug: "github",
        logo: "/assets/logo/github.png",
        desc: "Promotes open-source contribution and technical skills. A community for developers.",
    },
    {
        name: "PiXelance",
        slug: "pixelance",
        logo: "/assets/logo/pixelance_logo.png",
        desc: "For photography/videography enthusiasts to share passion and explore new subjects.",
    }
]

export function ClubsCarousel() {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    useEffect(() => {
        checkScroll()
        window.addEventListener('resize', checkScroll)
        return () => window.removeEventListener('resize', checkScroll)
    }, [])

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
            // Check scroll after animation roughly matches
            setTimeout(checkScroll, 300)
        }
    }

    // Auto-scroll effect (paused on hover)
    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
                } else {
                    scrollContainerRef.current.scrollBy({ left: 350, behavior: 'smooth' })
                }
                setTimeout(checkScroll, 300)
            }
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative group w-full max-w-7xl mx-auto px-4">

            {/* Left Button */}
            <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-all duration-300 ${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                aria-label="Scroll left"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Right Button */}
            <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-all duration-300 ${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                aria-label="Scroll right"
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className="flex gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-12 px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {clubs.map((club) => (
                    <div
                        key={club.slug}
                        className="snap-center shrink-0 w-[320px] md:w-[400px] group/card"
                    >
                        <Link
                            href={`/clubs/${club.slug}`}
                            className="block h-full relative"
                        >
                            {/* Gradient Border & Glow */}
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-[34px] blur opacity-30 group-hover/card:opacity-100 transition duration-500" />

                            <div className="relative h-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 flex flex-col items-center text-center transition-all duration-300 group-hover/card:scale-[1.02] group-hover/card:-translate-y-2">
                                {/* Logo Container - Circular White Background */}
                                <div className="h-40 w-40 mb-8 relative flex items-center justify-center rounded-full bg-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] group-hover/card:shadow-[0_12px_40px_rgba(59,130,246,0.3)] transition-all duration-500">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={club.logo}
                                        alt={club.name}
                                        className="w-32 h-32 object-contain"
                                    />
                                </div>

                                <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover/card:from-blue-400 group-hover/card:to-purple-400 transition-all duration-300">
                                    {club.name}
                                </h3>

                                <p className="text-gray-400 text-base leading-relaxed mb-8 line-clamp-3 group-hover/card:text-gray-300">
                                    {club.desc}
                                </p>

                                <div className="mt-auto w-full pt-6 border-t border-white/5 group-hover/card:border-blue-500/20 transition-colors">
                                    <span className="inline-flex items-center gap-2 text-blue-400 font-semibold group-hover/card:gap-3 transition-all">
                                        View Details <ArrowRight className="w-5 h-5" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}
