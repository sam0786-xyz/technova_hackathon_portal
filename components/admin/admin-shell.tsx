'use client'

import { useState, useCallback } from "react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { SidebarNav } from "./sidebar-nav"

export function AdminShell({ children, userName, userRole, userImage }: {
    children: React.ReactNode,
    userName?: string | null,
    userRole?: string | null,
    userImage?: string | null,
}) {
    const [collapsed, setCollapsed] = useState(false)

    const toggleSidebar = useCallback(() => {
        setCollapsed(prev => !prev)
    }, [])

    return (
        <div className="min-h-screen bg-black">
            {/* Mobile overlay when sidebar is open */}
            {!collapsed && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            {!collapsed && (
                <aside className="fixed top-0 left-0 z-40 h-screen w-64 bg-zinc-900 border-r border-white/10 flex flex-col">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                        <h2 className="font-bold text-xl text-white">Technova Admin</h2>
                        <button
                            type="button"
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            aria-label="Collapse sidebar"
                        >
                            <PanelLeftClose className="w-5 h-5 pointer-events-none" />
                        </button>
                    </div>
                    <SidebarNav />
                    <div className="p-4 border-t border-white/10 mt-auto shrink-0">
                        <div className="flex items-center gap-3">
                            {userImage ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={userImage} alt={userName || ''} className="w-10 h-10 rounded-full border border-white/20" referrerPolicy="no-referrer" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-400 font-bold">
                                    {userName?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium text-white">{userName}</p>
                                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                            </div>
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <main className={collapsed ? 'min-h-screen' : 'min-h-screen md:ml-64'}>
                {/* Open sidebar button when collapsed */}
                {collapsed && (
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-zinc-800 border border-white/10 text-gray-400 hover:text-white hover:bg-zinc-700 transition-colors shadow-lg cursor-pointer"
                        aria-label="Open sidebar"
                    >
                        <PanelLeftOpen className="w-5 h-5 pointer-events-none" />
                    </button>
                )}
                {children}
            </main>
        </div>
    )
}
