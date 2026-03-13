'use client'

import { useEffect, useRef } from 'react'

interface AnimatedBackgroundProps {
    variant?: 'default' | 'purple' | 'emerald' | 'amber'
    intensity?: 'low' | 'medium' | 'high'
    className?: string
}

const variants = {
    default: {
        color1: 'rgba(59, 130, 246, 0.15)',
        color2: 'rgba(147, 51, 234, 0.1)',
        color3: 'rgba(6, 182, 212, 0.08)'
    },
    purple: {
        color1: 'rgba(147, 51, 234, 0.15)',
        color2: 'rgba(219, 39, 119, 0.1)',
        color3: 'rgba(59, 130, 246, 0.08)'
    },
    emerald: {
        color1: 'rgba(16, 185, 129, 0.15)',
        color2: 'rgba(20, 184, 166, 0.1)',
        color3: 'rgba(34, 197, 94, 0.08)'
    },
    amber: {
        color1: 'rgba(245, 158, 11, 0.15)',
        color2: 'rgba(249, 115, 22, 0.1)',
        color3: 'rgba(234, 179, 8, 0.08)'
    }
}

export function AnimatedBackground({
    variant = 'default',
    intensity = 'medium',
    className = ''
}: AnimatedBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const colors = variants[variant]

    const intensityMultiplier = {
        low: 0.5,
        medium: 1,
        high: 1.5
    }[intensity]

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationId: number
        let time = 0

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        const animate = () => {
            time += 0.002 * intensityMultiplier

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Create gradient orbs
            const orbs = [
                {
                    x: canvas.width * 0.3 + Math.sin(time) * 100,
                    y: canvas.height * 0.3 + Math.cos(time * 0.8) * 80,
                    radius: 400 * intensityMultiplier,
                    color: colors.color1
                },
                {
                    x: canvas.width * 0.7 + Math.cos(time * 0.6) * 120,
                    y: canvas.height * 0.6 + Math.sin(time * 0.9) * 100,
                    radius: 350 * intensityMultiplier,
                    color: colors.color2
                },
                {
                    x: canvas.width * 0.5 + Math.sin(time * 1.2) * 80,
                    y: canvas.height * 0.8 + Math.cos(time * 0.7) * 60,
                    radius: 300 * intensityMultiplier,
                    color: colors.color3
                }
            ]

            orbs.forEach(orb => {
                const gradient = ctx.createRadialGradient(
                    orb.x, orb.y, 0,
                    orb.x, orb.y, orb.radius
                )
                gradient.addColorStop(0, orb.color)
                gradient.addColorStop(1, 'transparent')

                ctx.fillStyle = gradient
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            })

            animationId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationId)
        }
    }, [colors, intensityMultiplier])

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none z-0 ${className}`}
            style={{ background: 'transparent' }}
        />
    )
}
