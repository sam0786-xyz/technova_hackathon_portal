'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, motion, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedCounterProps {
    value: number
    suffix?: string
    prefix?: string
    duration?: number
    className?: string
    labelClassName?: string
    label?: string
}

export function AnimatedCounter({
    value,
    suffix = '',
    prefix = '',
    duration = 2,
    className = '',
    labelClassName = '',
    label
}: AnimatedCounterProps) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })
    const [hasAnimated, setHasAnimated] = useState(false)

    const spring = useSpring(0, {
        damping: 30,
        stiffness: 100,
        duration: duration * 1000
    })

    const display = useTransform(spring, (current) =>
        Math.floor(current)
    )

    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        if (isInView && !hasAnimated) {
            spring.set(value)
            setHasAnimated(true)
        }
    }, [isInView, value, spring, hasAnimated])

    useEffect(() => {
        return display.on('change', (latest) => {
            setDisplayValue(latest)
        })
    }, [display])

    return (
        <div ref={ref} className="text-center">
            <motion.div
                className={cn('text-4xl md:text-5xl font-bold tabular-nums', className)}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
            >
                {prefix}{displayValue}{suffix}
            </motion.div>
            {label && (
                <motion.p
                    className={cn('text-sm text-gray-400 uppercase tracking-widest mt-2', labelClassName)}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    {label}
                </motion.p>
            )}
        </div>
    )
}
