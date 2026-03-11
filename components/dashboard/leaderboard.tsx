'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Search, Trophy, ChevronLeft, ChevronRight, Home, Loader2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getLeaderboardData, getTopThreeUsers, LeaderboardUser, LeaderboardResponse, TimeFilter } from '@/lib/actions/leaderboard'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProfileHoverCard } from "@/components/dashboard/profile-hover-card"
import Link from 'next/link'

interface LeaderboardProps {
    initialData: LeaderboardResponse
    topThree: LeaderboardUser[]
}

const ITEMS_PER_PAGE = 10

const TIME_FILTERS: { value: TimeFilter; label: string }[] = [
    { value: 'all-time', label: 'All Time' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'yearly', label: 'This Year' }
]

export function Leaderboard({ initialData, topThree: initialTopThree }: LeaderboardProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all-time')
    const [data, setData] = useState<LeaderboardResponse>(initialData)
    const [topThree, setTopThree] = useState<LeaderboardUser[]>(initialTopThree)
    const [isPending, startTransition] = useTransition()

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState('')

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1) // Reset to page 1 on search
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    // Fetch data when page, search, or time filter changes
    useEffect(() => {
        startTransition(async () => {
            const [result, newTopThree] = await Promise.all([
                getLeaderboardData(currentPage, ITEMS_PER_PAGE, debouncedSearch || undefined, timeFilter),
                getTopThreeUsers(timeFilter)
            ])
            setData(result)
            setTopThree(newTopThree)
        })
    }, [currentPage, debouncedSearch, timeFilter])

    const handleTimeFilterChange = (filter: TimeFilter) => {
        setTimeFilter(filter)
        setCurrentPage(1)
    }

    // When not searching, filter out top 3 from list (they're shown in podium)
    // Only on page 1, skip first 3 users
    const displayUsers = !searchTerm && currentPage === 1
        ? data.users.slice(3) // Skip top 3 on first page
        : data.users

    const handleSearch = (value: string) => {
        setSearchTerm(value)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <div className="w-full bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link href="/" className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                    <Home className="w-4 h-4" />
                    Home
                </Link>
                <span className="text-gray-600">/</span>
                <span className="text-white">Leaderboard</span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                        Technova Leaderboard
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {timeFilter === 'all-time' ? 'All-time rankings' : `${TIME_FILTERS.find(f => f.value === timeFilter)?.label} rankings`} • {data.totalCount} members
                        {isPending && <Loader2 className="inline w-3 h-3 ml-2 animate-spin" />}
                    </p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-gray-800/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                    />
                </div>
            </div>

            {/* Time Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {TIME_FILTERS.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => handleTimeFilterChange(filter.value)}
                        disabled={isPending}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                            timeFilter === filter.value
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Top 3 Podium (Only when not searching) */}
            {!searchTerm && topThree.length > 0 && (
                <div className="flex justify-center items-end gap-2 sm:gap-4 md:gap-8 pt-8 sm:pt-12 pb-6 sm:pb-8 mb-6 sm:mb-8 overflow-x-auto">
                    {/* 2nd Place (Left) */}
                    {topThree[1] && (
                        <ProfileHoverCard user={topThree[1]} rank={2}>
                            <Link href={`/user/${topThree[1].id}`} className="flex flex-col items-center z-10 cursor-pointer hover:scale-105 transition-transform">
                                <div className="relative mb-4">
                                    <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-gray-400 shadow-[0_0_20px_rgba(156,163,175,0.3)]">
                                        <AvatarImage src={topThree[1].image || ""} alt={topThree[1].name} />
                                        <AvatarFallback className="bg-gray-800 text-gray-400 text-2xl font-bold">
                                            {topThree[1].name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-black font-bold text-sm border-2 border-gray-900">
                                        2
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <h3 className="font-bold text-gray-200 text-base md:text-lg text-center max-w-[120px] truncate">{topThree[1].name}</h3>
                                    <p className="text-cyan-400 font-mono text-sm md:text-base font-medium">{topThree[1].xp_points} XP</p>
                                </div>
                                <div className="w-24 md:w-32 h-32 md:h-40 bg-gradient-to-t from-gray-900/80 to-gray-800/50 rounded-t-lg border-t border-x border-gray-700/50 mt-4 backdrop-blur-sm" />
                            </Link>
                        </ProfileHoverCard>
                    )}

                    {/* 1st Place (Center) */}
                    {topThree[0] && (
                        <ProfileHoverCard user={topThree[0]} rank={1}>
                            <Link href={`/user/${topThree[0].id}`} className="flex flex-col items-center z-20 -mx-2 md:mx-0 order-first md:order-none cursor-pointer hover:scale-105 transition-transform">
                                <div className="relative mb-4">
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce">
                                        <Trophy className="w-8 h-8 fill-yellow-400" />
                                    </div>
                                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)] ring-4 ring-yellow-500/20">
                                        <AvatarImage src={topThree[0].image || ""} alt={topThree[0].name} />
                                        <AvatarFallback className="bg-gray-800 text-yellow-400 text-3xl font-bold">
                                            {topThree[0].name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-lg border-4 border-gray-900">
                                        1
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <h3 className="font-bold text-white text-lg md:text-xl text-center max-w-[150px] truncate">{topThree[0].name}</h3>
                                    <p className="text-cyan-400 font-mono text-base md:text-lg font-bold">{topThree[0].xp_points} XP</p>
                                </div>
                                <div className="w-28 md:w-40 h-40 md:h-52 bg-gradient-to-t from-yellow-900/40 to-yellow-600/20 rounded-t-lg border-t border-x border-yellow-500/30 mt-4 backdrop-blur-md relative overflow-hidden">
                                    <div className="absolute inset-0 bg-yellow-400/5" />
                                </div>
                            </Link>
                        </ProfileHoverCard>
                    )}

                    {/* 3rd Place (Right) */}
                    {topThree[2] && (
                        <ProfileHoverCard user={topThree[2]} rank={3}>
                            <Link href={`/user/${topThree[2].id}`} className="flex flex-col items-center z-10 cursor-pointer hover:scale-105 transition-transform">
                                <div className="relative mb-4">
                                    <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                                        <AvatarImage src={topThree[2].image || ""} alt={topThree[2].name} />
                                        <AvatarFallback className="bg-gray-800 text-orange-500 text-2xl font-bold">
                                            {topThree[2].name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold text-sm border-2 border-gray-900">
                                        3
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <h3 className="font-bold text-gray-200 text-base md:text-lg text-center max-w-[120px] truncate">{topThree[2].name}</h3>
                                    <p className="text-cyan-400 font-mono text-sm md:text-base font-medium">{topThree[2].xp_points} XP</p>
                                </div>
                                <div className="w-24 md:w-32 h-24 md:h-32 bg-gradient-to-t from-gray-900/80 to-gray-800/50 rounded-t-lg border-t border-x border-gray-700/50 mt-4 backdrop-blur-sm" />
                            </Link>
                        </ProfileHoverCard>
                    )}
                </div>
            )}

            {/* List View */}
            <div className={cn("rounded-2xl border border-white/5 bg-black/20 overflow-hidden", isPending && "opacity-60")}>
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-2 sm:px-4 md:px-6 py-3 sm:py-4">Rank</th>
                            <th className="px-2 sm:px-4 md:px-6 py-3 sm:py-4">User</th>
                            <th className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-right">XP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {displayUsers.map((user, idx) => {
                            // Calculate rank based on position
                            // When searching: rank = position in search results
                            // When not searching: rank = global position (accounting for top 3 in podium)
                            let rank: number
                            if (searchTerm) {
                                rank = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1
                            } else if (currentPage === 1) {
                                // First page: these are users 4+ (after podium top 3)
                                rank = idx + 4
                            } else {
                                // Other pages: offset + position + 1
                                rank = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1
                            }
                            return (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    key={user.id}
                                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                                    onClick={() => window.location.href = `/user/${user.id}`}
                                >
                                    <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-500 font-mono text-xs sm:text-sm">
                                        #{rank}
                                    </td>
                                    <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                                        <ProfileHoverCard user={user} rank={rank}>
                                            <Link href={`/user/${user.id}`} className="flex items-center gap-2 sm:gap-3">
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-200 group-hover:text-cyan-300 transition-colors text-sm sm:text-base truncate">{user.name}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[100px] sm:max-w-[150px] hidden sm:block">{user.email}</p>
                                                </div>
                                            </Link>
                                        </ProfileHoverCard>
                                    </td>
                                    <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-right font-mono text-cyan-300 font-medium text-sm sm:text-base">
                                        {user.xp_points}
                                    </td>
                                </motion.tr>
                            )
                        })}
                    </tbody>
                </table>

                {data.users.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                    <p className="text-xs sm:text-sm text-gray-400">
                        Page {currentPage} of {data.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1 || isPending}
                            className="flex items-center gap-1 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                                let pageNum: number
                                if (data.totalPages <= 5) {
                                    pageNum = i + 1
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1
                                } else if (currentPage >= data.totalPages - 2) {
                                    pageNum = data.totalPages - 4 + i
                                } else {
                                    pageNum = currentPage - 2 + i
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        disabled={isPending}
                                        className={cn(
                                            "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
                                            currentPage === pageNum
                                                ? "bg-blue-600 text-white"
                                                : "bg-white/5 text-gray-300 hover:bg-white/10"
                                        )}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}
                        </div>
                        <button
                            onClick={() => handlePageChange(Math.min(data.totalPages, currentPage + 1))}
                            disabled={currentPage === data.totalPages || isPending}
                            className="flex items-center gap-1 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
