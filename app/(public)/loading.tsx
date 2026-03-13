'use client'

import { motion } from 'framer-motion'

export default function PublicLoading() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Orbital Loader */}
                <div className="relative w-24 h-24 mb-8">
                    {/* Outer Ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-500/50"
                    />

                    {/* Middle Ring */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-2 rounded-full border-2 border-transparent border-b-purple-500 border-l-purple-500/50"
                    />

                    {/* Inner Core */}
                    <motion.div
                        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-[2px]"
                    />
                </div>

                {/* Loading Text */}
                <motion.h2
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-xl font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400"
                >
                    INITIALIZING
                </motion.h2>

                <motion.p
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="text-xs text-blue-500/60 font-mono mt-3 uppercase tracking-widest"
                >
                    Connecting to DevSpace...
                </motion.p>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)] pointer-events-none" />
        </div>
    )
}
