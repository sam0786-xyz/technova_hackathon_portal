"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Search, Code, BookOpen, Sparkles, Bug } from "lucide-react";

const tabs = [
    {
        name: "Community",
        href: "/community",
        icon: Users,
        color: "blue"
    },
    {
        name: "Buddy Finder",
        href: "/buddy-finder",
        icon: Search,
        color: "purple"
    },
    {
        name: "Report Bug",
        href: "/report-bug",
        icon: Bug,
        color: "red"
    }
];

export function DevSpaceTabs() {
    const pathname = usePathname();

    // Only show tabs if we are on a DevSpace page
    const isDevSpacePage = tabs.some(tab => pathname.startsWith(tab.href));

    if (!isDevSpacePage) return null;

    return (
        <div className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-16 z-40 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            <div className="container mx-auto px-4">
                {/* DevSpace Label */}
                <div className="flex items-center gap-4 py-2 border-b border-white/5">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">DevSpace</span>
                    </div>
                    <p className="text-xs text-gray-500 hidden sm:block">Student Community Hub</p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar py-1">
                    {tabs.map((tab) => {
                        const isActive = pathname.startsWith(tab.href);
                        const colorClasses = {
                            blue: isActive ? "border-blue-500 text-blue-400 bg-blue-500/10" : "hover:text-blue-400 hover:bg-blue-500/5",
                            purple: isActive ? "border-purple-500 text-purple-400 bg-purple-500/10" : "hover:text-purple-400 hover:bg-purple-500/5",
                            emerald: isActive ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" : "hover:text-emerald-400 hover:bg-emerald-500/5",
                            amber: isActive ? "border-amber-500 text-amber-400 bg-amber-500/10" : "hover:text-amber-400 hover:bg-amber-500/5",
                            red: isActive ? "border-red-500 text-red-400 bg-red-500/10" : "hover:text-red-400 hover:bg-red-500/5",
                        };

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 border-b-2 whitespace-nowrap rounded-t-lg",
                                    isActive
                                        ? colorClasses[tab.color as keyof typeof colorClasses]
                                        : `border-transparent text-gray-400 ${colorClasses[tab.color as keyof typeof colorClasses]}`
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
