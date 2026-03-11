'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface RevealOnScrollProps {
    children: React.ReactNode
    className?: string
    direction?: 'up' | 'down' | 'left' | 'right'
    delay?: number
    duration?: number
    once?: boolean
}

const directionVariants = {
    up: { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } },
    down: { hidden: { opacity: 0, y: -50 }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } }
}

export function RevealOnScroll({
    children,
    className,
    direction = 'up',
    delay = 0,
    duration = 0.6,
    once = true
}: RevealOnScrollProps) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once, margin: '-50px' })
    const variants = directionVariants[direction]

    return (
        <motion.div
            ref={ref}
            className={cn(className)}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={variants}
            transition={{
                duration,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98]
            }}
        >
            {children}
        </motion.div>
    )
}

interface StaggerContainerProps {
    children: React.ReactNode
    className?: string
    staggerDelay?: number
}

export function StaggerContainer({
    children,
    className,
    staggerDelay = 0.1
}: StaggerContainerProps) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, margin: '-50px' })

    return (
        <motion.div
            ref={ref}
            className={cn(className)}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: staggerDelay
                    }
                }
            }}
        >
            {children}
        </motion.div>
    )
}

export function StaggerItem({
    children,
    className
}: {
    children: React.ReactNode;
    className?: string
}) {
    return (
        <motion.div
            className={cn(className)}
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.5,
                        ease: [0.21, 0.47, 0.32, 0.98]
                    }
                }
            }}
        >
            {children}
        </motion.div>
    )
}
