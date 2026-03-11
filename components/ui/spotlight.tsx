'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface SpotlightProps {
    children: React.ReactNode
    className?: string
    spotlightColor?: string
    spotlightSize?: number
}

export function Spotlight({
    children,
    className,
    spotlightColor = 'rgba(59, 130, 246, 0.15)',
    spotlightSize = 400
}: SpotlightProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect()
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            })
        }

        container.addEventListener('mousemove', handleMouseMove)
        return () => container.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return (
        <div
            ref={containerRef}
            className={cn('relative overflow-hidden', className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Spotlight effect */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
                style={{
                    opacity: isHovered ? 1 : 0,
                    background: `radial-gradient(${spotlightSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${spotlightColor}, transparent 80%)`
                }}
            />

            {/* Content */}
            <div className="relative z-0">
                {children}
            </div>
        </div>
    )
}
