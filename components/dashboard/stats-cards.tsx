'use client'

import { motion } from 'framer-motion'
import { Zap, Calendar, UserCircle } from 'lucide-react'

interface StatsCardsProps {
    xp: number
    role: string
}

export function StatsCards({ xp, role }: StatsCardsProps) {
    const stats = [
        {
            label: "Total XP",
            value: xp,
            icon: Zap,
            color: "text-yellow-400",
            bg: "bg-yellow-400/10",
            border: "border-yellow-400/20"
        },
        {
            label: "Events Attended",
            value: "0", // Dynamic later
            icon: Calendar,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20"
        },
        {
            label: "Current Role",
            value: role || "Member",
            icon: UserCircle,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
            border: "border-purple-400/20",
            capitalize: true
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={stat.label}
                    className={`p-6 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-lg`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                            <p className={`text-2xl font-bold text-white mt-1 ${stat.capitalize ? 'capitalize' : ''}`}>
                                {stat.value}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
