'use client'

import { Trophy, Mail, GraduationCap, Award, Calendar, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import type { LeaderboardUser } from '@/lib/actions/leaderboard'
import Link from 'next/link'

interface ProfileHoverCardProps {
    user: LeaderboardUser & {
        year?: number
        branch?: string
        eventsAttended?: number
        skills?: string[]
    }
    rank: number
    children: React.ReactNode
}

export function ProfileHoverCard({ user, rank, children }: ProfileHoverCardProps) {
    return (
        <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="w-80">
                {/* Header with Avatar */}
                <div className="flex gap-4">
                    <Avatar className="w-16 h-16 border-2 border-cyan-500/30">
                        <AvatarImage src={user.image || ""} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-xl font-bold">
                            {user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-lg truncate">{user.name}</h4>
                        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate">{user.email?.split('@')[0]}@...</span>
                        </div>
                        {user.role && (
                            <span className="inline-flex items-center mt-1.5 px-2 py-0.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-xs text-blue-300 capitalize">
                                {user.role}
                            </span>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10 my-4" />

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Rank */}
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white">#{rank}</p>
                            <p className="text-xs text-gray-500">Rank</p>
                        </div>
                    </div>

                    {/* XP */}
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <Award className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-cyan-400">{user.xp_points}</p>
                            <p className="text-xs text-gray-500">XP</p>
                        </div>
                    </div>

                    {/* Year (if available) */}
                    {user.year && (
                        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-white">Year {user.year}</p>
                                <p className="text-xs text-gray-500">Academic</p>
                            </div>
                        </div>
                    )}

                    {/* Events (if available) */}
                    {user.eventsAttended !== undefined && (
                        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-green-400" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-white">{user.eventsAttended}</p>
                                <p className="text-xs text-gray-500">Events</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Branch (if available) */}
                {user.branch && (
                    <div className="mt-3 px-3 py-2 bg-white/5 rounded-lg">
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="text-sm text-gray-300">{user.branch}</p>
                    </div>
                )}

                {/* Skills (if available) */}
                {user.skills && user.skills.length > 0 && (
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                            <Sparkles className="w-3 h-3" />
                            Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {user.skills.slice(0, 3).map(skill => (
                                <span key={skill} className="px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-xs text-blue-300">
                                    {skill}
                                </span>
                            ))}
                            {user.skills.length > 3 && (
                                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-500">
                                    +{user.skills.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* View Profile Link */}
                <Link
                    href={`/user/${user.id}`}
                    className="mt-4 block w-full text-center py-2 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-medium rounded-lg transition-all"
                >
                    View Full Profile
                </Link>
            </HoverCardContent>
        </HoverCard>
    )
}
