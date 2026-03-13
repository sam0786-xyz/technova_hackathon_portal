'use client'

import { Trophy, TrendingUp, Star, Award, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRankInfo } from '@/lib/actions/leaderboard'

interface MyRankWidgetProps {
    rankInfo: UserRankInfo | null
    userName?: string
}

export function MyRankWidget({ rankInfo, userName }: MyRankWidgetProps) {
    if (!rankInfo) {
        return (
            <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <p className="text-gray-400 text-sm">Unable to load your rank</p>
            </div>
        )
    }

    const { rank, xp_points, totalUsers, percentile, isTopTen, eventsAttended } = rankInfo

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl p-6 border transition-all",
            isTopTen
                ? "bg-gradient-to-br from-yellow-900/30 via-amber-900/20 to-orange-900/30 border-yellow-500/30 shadow-[0_0_30px_rgba(250,204,21,0.15)]"
                : "bg-gray-900/50 backdrop-blur-xl border-white/10"
        )}>
            {/* Glow effect for top 10 */}
            {isTopTen && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl" />
            )}

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            isTopTen ? "bg-yellow-500/20" : "bg-blue-500/20"
                        )}>
                            {isTopTen ? (
                                <Trophy className="w-5 h-5 text-yellow-400" />
                            ) : (
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-400">Your Rank</h3>
                            {userName && (
                                <p className="text-xs text-gray-500 truncate max-w-[120px]">{userName}</p>
                            )}
                        </div>
                    </div>
                    {isTopTen && (
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-medium text-yellow-400">Top 10</span>
                        </div>
                    )}
                </div>

                {/* Rank Number */}
                <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                        <span className="text-gray-500 text-lg">#</span>
                        <span className={cn(
                            "text-5xl font-bold tracking-tight",
                            isTopTen ? "text-yellow-400" : "text-white"
                        )}>
                            {rank}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">/ {totalUsers}</span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                    {/* XP */}
                    <div className="bg-white/5 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Award className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs text-gray-400">Total XP</span>
                        </div>
                        <p className="text-xl font-bold text-cyan-400 font-mono">
                            {xp_points.toLocaleString()}
                        </p>
                    </div>

                    {/* Events Attended */}
                    <div className="bg-white/5 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-gray-400">Events</span>
                        </div>
                        <p className="text-xl font-bold text-purple-400 font-mono">
                            {eventsAttended}
                        </p>
                    </div>

                    {/* Percentile */}
                    <div className="bg-white/5 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-gray-400">Percentile</span>
                        </div>
                        <p className="text-xl font-bold text-green-400">
                            Top {100 - percentile}%
                        </p>
                    </div>
                </div>

                {/* Progress bar showing relative position */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>#1</span>
                        <span>#{totalUsers}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all",
                                isTopTen
                                    ? "bg-gradient-to-r from-yellow-500 to-amber-400"
                                    : "bg-gradient-to-r from-cyan-500 to-blue-500"
                            )}
                            style={{ width: `${Math.max(2, 100 - ((rank / totalUsers) * 100))}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
