'use client'

import { Code2, Users, Rocket, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
    {
        label: "Active Members",
        value: "2500+",
        icon: Users,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30"
    },
    {
        label: "Projects Built",
        value: "50+",
        icon: Rocket,
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
        borderColor: "border-purple-500/30"
    },
    {
        label: "Awards Won",
        value: "15+",
        icon: Trophy,
        color: "text-amber-400",
        bgColor: "bg-amber-500/20",
        borderColor: "border-amber-500/30"
    },
    {
        label: "Events Yearly",
        value: "50+",
        icon: Code2,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/20",
        borderColor: "border-emerald-500/30"
    }
]

export function EcosystemHighlight() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`text-center p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:${stat.borderColor} hover:bg-white/[0.06] transition-all duration-500 group shadow-[0_8px_32px_rgba(0,0,0,0.3)]`}
                >
                    <div className={`mx-auto mb-4 w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className="w-7 h-7" />
                    </div>
                    <div className="text-4xl font-bold mb-2 text-white">{stat.value}</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
            ))}
        </div>
    );
}
