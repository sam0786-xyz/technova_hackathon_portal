'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlowCardProps {
    children: React.ReactNode
    className?: string
    glowColor?: string
    borderRadius?: string
}

export function GlowCard({
    children,
    className = '',
    glowColor = 'rgba(59, 130, 246, 0.5)',
    borderRadius = '1.5rem'
}: GlowCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        })
    }

    return (
        <motion.div
            ref={cardRef}
            className={cn(
                'relative overflow-hidden',
                className
            )}
            style={{ borderRadius }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
        >
            {/* Glow effect */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 40%)`,
                    borderRadius
                }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            />

            {/* Border glow */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                    borderRadius,
                    border: '1px solid transparent',
                    background: `linear-gradient(black, black) padding-box, 
                                radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 40%) border-box`
                }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            />

            {/* Content */}
            <div className="relative z-20 bg-white/[0.03] backdrop-blur-xl border border-white/10 h-full" style={{ borderRadius }}>
                {children}
            </div>
        </motion.div>
    )
}
