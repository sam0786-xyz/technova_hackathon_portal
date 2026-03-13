'use client'

import { useState } from 'react'
import { forceRevalidateLeaderboard } from '@/lib/actions/force-cache-refresh'
import { RefreshCw } from 'lucide-react'

/**
 * Admin button to force refresh leaderboard cache
 * Use after manual SQL updates
 */
export default function ForceRefreshButton() {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [message, setMessage] = useState('')

    const handleRefresh = async () => {
        setIsRefreshing(true)
        setMessage('')

        try {
            const result = await forceRevalidateLeaderboard()
            setMessage(result.message)

            if (result.success) {
                // Reload the page to show fresh data
                setTimeout(() => window.location.reload(), 1000)
            }
        } catch (error) {
            setMessage('Error refreshing cache')
        } finally {
            setIsRefreshing(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Force Refresh Leaderboard'}
            </button>
            {message && (
                <p className={`text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                    {message}
                </p>
            )}
            <p className="text-xs text-gray-500 text-center max-w-xs">
                Use this after running SQL updates to immediately refresh the leaderboard cache
            </p>
        </div>
    )
}
