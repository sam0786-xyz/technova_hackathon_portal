"use client"

import { useState, useEffect } from "react"
import { Award, Download, RefreshCw, Ban, CheckCircle, Loader2, Users, TrendingUp, AlertTriangle } from "lucide-react"
import { Toast, useToast } from "@/components/ui/toast"
import {
    getEventCertificates,
    getCertificateStats,
    releaseCertificates,
    revokeCertificate,
    reinstateCertificate,
    getCertificateTemplate
} from "@/lib/actions/certificates"
import { formatDateShort } from "@/lib/utils"
import type { Certificate } from "@/types/custom"

interface CertificateManagerProps {
    eventId: string
    eventTitle: string
}

interface CertificateWithUser extends Certificate {
    user: {
        name: string | null
        email: string | null
    }
}

interface Stats {
    total: number
    valid: number
    revoked: number
    downloads: number
}

export function CertificateManager({ eventId, eventTitle }: CertificateManagerProps) {
    const [certificates, setCertificates] = useState<CertificateWithUser[]>([])
    const [stats, setStats] = useState<Stats>({ total: 0, valid: 0, revoked: 0, downloads: 0 })
    const [hasTemplate, setHasTemplate] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isReleasing, setIsReleasing] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [revokeModal, setRevokeModal] = useState<{ open: boolean; certificateId: string; name: string } | null>(null)
    const [revokeReason, setRevokeReason] = useState("")

    const { toast, showToast, hideToast } = useToast()

    // Load data
    const loadData = async () => {
        setIsLoading(true)
        try {
            const [certsData, statsData, template] = await Promise.all([
                getEventCertificates(eventId),
                getCertificateStats(eventId),
                getCertificateTemplate(eventId)
            ])
            setCertificates(certsData as CertificateWithUser[])
            setStats(statsData)
            setHasTemplate(!!template)
        } catch (error) {
            console.error('Load error:', error)
            showToast('Failed to load certificates', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [eventId])

    // Release certificates
    const handleRelease = async () => {
        if (!hasTemplate) {
            showToast('Please configure a certificate template first', 'error')
            return
        }

        setIsReleasing(true)
        try {
            const result = await releaseCertificates(eventId)
            showToast(result.message, 'success')
            await loadData()
        } catch (error: any) {
            showToast(error.message || 'Failed to release certificates', 'error')
        } finally {
            setIsReleasing(false)
        }
    }

    // Revoke certificate
    const handleRevoke = async () => {
        if (!revokeModal || !revokeReason.trim()) return

        setActionLoading(revokeModal.certificateId)
        try {
            await revokeCertificate(revokeModal.certificateId, revokeReason)
            showToast('Certificate revoked', 'success')
            setRevokeModal(null)
            setRevokeReason("")
            await loadData()
        } catch (error) {
            showToast('Failed to revoke certificate', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    // Reinstate certificate
    const handleReinstate = async (certificateId: string) => {
        setActionLoading(certificateId)
        try {
            await reinstateCertificate(certificateId)
            showToast('Certificate reinstated', 'success')
            await loadData()
        } catch (error) {
            showToast('Failed to reinstate certificate', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

            {/* Warning if no template */}
            {!hasTemplate && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-yellow-400 font-medium">No Certificate Template</p>
                        <p className="text-yellow-500/80 text-sm">
                            Please configure a certificate template before releasing certificates.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-500/20 rounded-lg">
                            <Award className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                            <p className="text-xs text-gray-500">Total Issued</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.valid}</p>
                            <p className="text-xs text-gray-500">Valid</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <Ban className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.revoked}</p>
                            <p className="text-xs text-gray-500">Revoked</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Download className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.downloads}</p>
                            <p className="text-xs text-gray-500">Downloads</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
                <button
                    onClick={handleRelease}
                    disabled={isReleasing || !hasTemplate}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    {isReleasing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Releasing...
                        </>
                    ) : (
                        <>
                            <Award className="w-4 h-4" />
                            Release Certificates
                        </>
                    )}
                </button>

                {stats.total > 0 && (
                    <a
                        href={`/api/certificate/bulk?eventId=${eventId}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download All (ZIP)
                    </a>
                )}

                <button
                    onClick={loadData}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Certificates Table */}
            {certificates.length > 0 ? (
                <div className="bg-gray-900 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-800">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Participant
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Certificate ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Issued At
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Downloads
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {certificates.map((cert) => (
                                    <tr key={cert.id} className="hover:bg-gray-800/50">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-white font-medium">{cert.user?.name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500">{cert.user?.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <code className="text-violet-400 bg-violet-500/10 px-2 py-1 rounded text-sm">
                                                {cert.certificate_id}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-sm">
                                            {formatDateShort(cert.issued_at)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {cert.status === 'valid' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Valid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-xs">
                                                    <Ban className="w-3 h-3" />
                                                    Revoked
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-sm">
                                            {cert.downloaded_count || 0}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={`/api/certificate?id=${cert.certificate_id}`}
                                                    target="_blank"
                                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                                {cert.status === 'valid' ? (
                                                    <button
                                                        onClick={() => setRevokeModal({
                                                            open: true,
                                                            certificateId: cert.certificate_id,
                                                            name: cert.user?.name || 'Unknown'
                                                        })}
                                                        disabled={actionLoading === cert.certificate_id}
                                                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                                        title="Revoke"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReinstate(cert.certificate_id)}
                                                        disabled={actionLoading === cert.certificate_id}
                                                        className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                                                        title="Reinstate"
                                                    >
                                                        {actionLoading === cert.certificate_id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-900 rounded-xl p-12 text-center">
                    <Award className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">No certificates issued yet</p>
                    <p className="text-sm text-gray-500">
                        {hasTemplate
                            ? 'Click "Release Certificates" to issue certificates to all attended participants.'
                            : 'Configure a template first, then release certificates.'}
                    </p>
                </div>
            )}

            {/* Revoke Modal */}
            {revokeModal?.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Revoke Certificate</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            You are about to revoke the certificate for <strong className="text-white">{revokeModal.name}</strong>.
                            This action can be undone later.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">Reason for revocation *</label>
                            <textarea
                                value={revokeReason}
                                onChange={(e) => setRevokeReason(e.target.value)}
                                placeholder="Enter the reason for revoking this certificate..."
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setRevokeModal(null)
                                    setRevokeReason("")
                                }}
                                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRevoke}
                                disabled={!revokeReason.trim() || actionLoading === revokeModal.certificateId}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {actionLoading === revokeModal.certificateId ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Revoke'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
