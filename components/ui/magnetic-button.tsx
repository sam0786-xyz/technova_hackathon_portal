'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MagneticButtonProps {
    children: React.ReactNode
    className?: string
    strength?: number
    as?: 'button' | 'a' | 'div'
    href?: string
    onClick?: () => void
}

export function MagneticButton({
    children,
    className,
    strength = 0.3,
    as = 'button',
    href,
    onClick
}: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return

        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const x = (e.clientX - centerX) * strength
        const y = (e.clientY - centerY) * strength

        setPosition({ x, y })
    }

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 })
    }

    const Comp = as === 'a' ? 'a' : as === 'div' ? 'div' : 'button'

    return (
        <motion.div
            ref={ref}
            className="inline-block"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
        >
            <Comp
                className={cn(className)}
                href={as === 'a' ? href : undefined}
                onClick={onClick}
            >
                {children}
            </Comp>
        </motion.div>
    )
}
