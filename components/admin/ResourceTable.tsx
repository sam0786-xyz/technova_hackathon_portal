'use client'

import { approveResource, deleteResource } from "@/lib/actions/resources"
import { Check, Trash2, ExternalLink, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useState } from "react"
import { Toast, useToast } from "@/components/ui/toast"

export function ResourceTable({ resources }: { resources: any[] }) {
    const [loading, setLoading] = useState<string | null>(null)
    const { toast, showToast, hideToast } = useToast()

    const handleApprove = async (id: string) => {
        setLoading(id)
        try {
            await approveResource(id)
            showToast("Resource approved successfully", "success")
        } catch (error) {
            showToast("Failed to approve resource", "error")
            console.error(error)
        } finally {
            setLoading(null)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resource?")) return
        setLoading(id)
        try {
            await deleteResource(id)
            showToast("Resource deleted successfully", "success")
        } catch (error) {
            showToast("Failed to delete resource", "error")
            console.error(error)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="bg-white/[0.03] rounded-xl border border-white/10 shadow-sm overflow-hidden backdrop-blur-xl text-white">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="p-4 font-medium text-gray-400">Title</th>
                            <th className="p-4 font-medium text-gray-400">Subject/Sem</th>
                            <th className="p-4 font-medium text-gray-400">Uploaded By</th>
                            <th className="p-4 font-medium text-gray-400">Status</th>
                            <th className="p-4 font-medium text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {resources.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No resources found.
                                </td>
                            </tr>
                        ) : (
                            resources.map((res: any) => (
                                <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-white">{res.title}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                {res.type}
                                            </span>
                                            <a
                                                href={res.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-500 hover:text-amber-400 transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-gray-300">{res.subject || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{res.semester || 'N/A'}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-gray-300">{res.user.name}</div>
                                        <div className="text-xs text-gray-500">{res.user.email}</div>
                                        <div className="text-[10px] text-gray-600 mt-0.5">{formatDate(res.created_at)}</div>
                                    </td>
                                    <td className="p-4">
                                        {res.is_verified ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                <Check className="w-3 h-3" />
                                                Live
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                <Clock className="w-3 h-3" />
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {!res.is_verified && (
                                                <button
                                                    onClick={() => handleApprove(res.id)}
                                                    disabled={loading === res.id}
                                                    className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-all disabled:opacity-50"
                                                    title="Approve"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(res.id)}
                                                disabled={loading === res.id}
                                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </div>
    )
}
