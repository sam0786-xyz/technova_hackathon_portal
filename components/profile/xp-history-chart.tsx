'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Calendar, Zap } from 'lucide-react'
import type { XPHistoryResponse } from '@/lib/actions/xp-history'

interface XPHistoryChartProps {
    data: XPHistoryResponse
}

export function XPHistoryChart({ data }: XPHistoryChartProps) {
    const { history, totalXp, eventCount } = data

    if (history.length === 0) {
        return (
            <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">XP Progress</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Zap className="w-12 h-12 mb-3 opacity-50" />
                    <p>No XP earned in the last 30 days</p>
                    <p className="text-sm">Attend events to start tracking your progress!</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">XP Progress</h3>
                </div>
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-400 font-medium">{totalXp} XP earned</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 font-medium">{eventCount} events</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={history}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#6b7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                            }}
                            labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                        <div className="bg-gray-800 border border-white/10 rounded-xl p-3 shadow-xl">
                                            <p className="text-gray-400 text-xs mb-1">{label}</p>
                                            <p className="text-cyan-400 font-bold text-lg">+{data.xp} XP</p>
                                            <p className="text-gray-500 text-xs">Total: {data.cumulativeXp} XP</p>
                                            {data.eventTitle && (
                                                <p className="text-gray-400 text-xs mt-1 max-w-[200px] truncate">
                                                    {data.eventTitle}
                                                </p>
                                            )}
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="cumulativeXp"
                            stroke="#06b6d4"
                            strokeWidth={2}
                            fill="url(#xpGradient)"
                            dot={{ fill: '#06b6d4', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center mt-4">
                <p className="text-xs text-gray-500">Last 30 days • Cumulative XP over time</p>
            </div>
        </div>
    )
}
