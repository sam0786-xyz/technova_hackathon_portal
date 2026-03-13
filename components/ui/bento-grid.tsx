'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface BentoGridProps {
    children: React.ReactNode
    className?: string
}

export function BentoGrid({ children, className }: BentoGridProps) {
    return (
        <div className={cn(
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
            className
        )}>
            {children}
        </div>
    )
}

interface BentoItemProps {
    children: React.ReactNode
    className?: string
    colSpan?: 1 | 2 | 3
    rowSpan?: 1 | 2
    glowColor?: string
    index?: number
}

export function BentoItem({
    children,
    className,
    colSpan = 1,
    rowSpan = 1,
    glowColor = 'rgba(59, 130, 246, 0.3)',
    index = 0
}: BentoItemProps) {
    const colSpanClasses = {
        1: '',
        2: 'md:col-span-2',
        3: 'md:col-span-2 lg:col-span-3'
    }

    const rowSpanClasses = {
        1: '',
        2: 'row-span-2'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98]
            }}
            whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 }
            }}
            className={cn(
                'group relative overflow-hidden rounded-2xl md:rounded-3xl',
                'bg-white/[0.03] backdrop-blur-xl border border-white/10',
                'hover:border-white/20 hover:bg-white/[0.05]',
                'transition-colors duration-500',
                'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
                colSpanClasses[colSpan],
                rowSpanClasses[rowSpan],
                className
            )}
            style={{
                boxShadow: `0 8px 32px rgba(0,0,0,0.3)`
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 40px ${glowColor.replace('0.3', '0.15')}`
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3)`
            }}
        >
            {/* Gradient overlay on hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at top, ${glowColor}, transparent 70%)`
                }}
            />

            {/* Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    )
}
