'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
    className?: string
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-white/10',
                className
            )}
        />
    )
}

// Common skeleton patterns
export function SkeletonCard() {
    return (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
            </div>
        </div>
    )
}

export function SkeletonEventCard() {
    return (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
            <Skeleton className="h-44 w-full" />
            <div className="p-6 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                </div>
            </div>
        </div>
    )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
                <Skeleton className="h-6 w-48" />
            </div>
            <div className="divide-y divide-white/5">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export function SkeletonStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-14 w-14 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function SkeletonProfile() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function SkeletonEventDetail() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Skeleton className="h-64 md:h-96 w-full" />
            <div className="container mx-auto px-4 -mt-20 relative z-10 space-y-8">
                <div className="bg-white rounded-xl shadow-xl p-8 space-y-4">
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-8 w-32 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-2/3" />
                    <div className="flex flex-wrap gap-6">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-6 w-36" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl shadow-xl p-8 space-y-4">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                    <div>
                        <div className="bg-white rounded-xl shadow-xl p-6 space-y-4">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-12 w-full rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
