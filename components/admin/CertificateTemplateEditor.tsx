"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, Move, Type, Plus, Trash2, Eye, Save, Loader2 } from "lucide-react"
import { Toast, useToast } from "@/components/ui/toast"
import type { QRRegion, TextRegion, TextFieldType } from "@/types/custom"
import { createCertificateTemplate, getCertificateTemplate, uploadCertificateTemplate } from "@/lib/actions/certificates"

interface CertificateTemplateEditorProps {
    eventId: string
    onSave?: () => void
}

const TEXT_FIELD_OPTIONS: { value: TextFieldType; label: string }[] = [
    { value: 'participant_name', label: 'Participant Name' },
    { value: 'event_name', label: 'Event Name' },
    { value: 'event_date', label: 'Event Date' },
    { value: 'certificate_id', label: 'Certificate ID' },
    { value: 'organizer_name', label: 'Organizer Name' },
    { value: 'role_title', label: 'Role/Title' },
]

const SAMPLE_DATA: Record<TextFieldType, string> = {
    participant_name: 'John Doe',
    event_name: 'AI Workshop 2026',
    event_date: 'January 9, 2026',
    certificate_id: 'ABC12345',
    organizer_name: 'Technova',
    role_title: 'Winner',
}

export function CertificateTemplateEditor({ eventId, onSave }: CertificateTemplateEditorProps) {
    const [templateUrl, setTemplateUrl] = useState<string | null>(null)
    const [templatePreview, setTemplatePreview] = useState<string | null>(null)
    const [qrRegion, setQrRegion] = useState<QRRegion>({ x: 80, y: 80, width: 15, height: 15 })
    const [textRegions, setTextRegions] = useState<TextRegion[]>([])
    const [isDrawingQR, setIsDrawingQR] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [dragTarget, setDragTarget] = useState<{ type: 'qr' | 'text', id?: string } | null>(null)
    const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null)
    const { toast, showToast, hideToast } = useToast()

    // Load existing template
    useEffect(() => {
        async function loadTemplate() {
            try {
                const template = await getCertificateTemplate(eventId)
                if (template) {
                    setTemplateUrl(template.template_url)
                    // Use signed URL for preview if available
                    setTemplatePreview(template.signedUrl || template.template_url)
                    setQrRegion(template.qr_region)
                    setTextRegions(template.text_regions)
                }
            } catch (error) {
                console.error('Failed to load template:', error)
            } finally {
                setIsLoading(false)
            }
        }
        loadTemplate()
    }, [eventId])

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            showToast('Please upload a PNG or JPG image', 'error')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size must be less than 5MB', 'error')
            return
        }

        setIsUploading(true)
        try {
            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => {
                setTemplatePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)

            // Upload to storage
            const url = await uploadCertificateTemplate(file, eventId)
            setTemplateUrl(url)
            showToast('Template uploaded successfully', 'success')
        } catch (error) {
            console.error('Upload error:', error)
            showToast('Failed to upload template', 'error')
        } finally {
            setIsUploading(false)
        }
    }

    // Get mouse position relative to container as percentage
    const getRelativePosition = useCallback((e: React.MouseEvent) => {
        if (!containerRef.current) return { x: 0, y: 0 }
        const rect = containerRef.current.getBoundingClientRect()
        return {
            x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
            y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
        }
    }, [])

    // Handle mouse down for dragging
    const handleMouseDown = (e: React.MouseEvent, target: { type: 'qr' | 'text', id?: string }) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
        setDragTarget(target)
        setDragStart(getRelativePosition(e))
    }

    // Handle mouse move
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !dragTarget || !dragStart) return

        const pos = getRelativePosition(e)
        const deltaX = pos.x - dragStart.x
        const deltaY = pos.y - dragStart.y

        if (dragTarget.type === 'qr') {
            setQrRegion(prev => ({
                ...prev,
                x: Math.max(0, Math.min(100 - prev.width, prev.x + deltaX)),
                y: Math.max(0, Math.min(100 - prev.height, prev.y + deltaY)),
            }))
        } else if (dragTarget.type === 'text' && dragTarget.id) {
            setTextRegions(prev => prev.map(region =>
                region.id === dragTarget.id
                    ? {
                        ...region,
                        x: Math.max(0, Math.min(100, region.x + deltaX)),
                        y: Math.max(0, Math.min(100, region.y + deltaY)),
                    }
                    : region
            ))
        }

        setDragStart(pos)
    }

    // Handle mouse up
    const handleMouseUp = () => {
        setIsDragging(false)
        setDragTarget(null)
        setDragStart(null)
    }

    // Add new text region
    const addTextRegion = (field: TextFieldType) => {
        const newRegion: TextRegion = {
            id: `text-${Date.now()}`,
            field,
            x: 50,
            y: 50,
            fontSize: 24,
            color: '#000000',
            fontWeight: 'bold',
            alignment: 'center',
        }
        setTextRegions(prev => [...prev, newRegion])
    }

    // Remove text region
    const removeTextRegion = (id: string) => {
        setTextRegions(prev => prev.filter(r => r.id !== id))
    }

    // Update text region property
    const updateTextRegion = (id: string, updates: Partial<TextRegion>) => {
        setTextRegions(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
    }

    // Save template
    const handleSave = async () => {
        if (!templateUrl) {
            showToast('Please upload a template first', 'error')
            return
        }

        setIsSaving(true)
        try {
            await createCertificateTemplate(eventId, templateUrl, qrRegion, textRegions)
            showToast('Template saved successfully', 'success')
            onSave?.()
        } catch (error) {
            console.error('Save error:', error)
            showToast('Failed to save template', 'error')
        } finally {
            setIsSaving(false)
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

            {/* Upload Section */}
            {!templatePreview && (
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <p className="text-gray-400 mb-4">Upload your certificate template (PNG or JPG)</p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg cursor-pointer transition-colors">
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Choose File
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={isUploading}
                        />
                    </label>
                </div>
            )}

            {/* Template Editor */}
            {templatePreview && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Canvas Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-900 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-semibold">Template Preview</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        {showPreview ? 'Edit Mode' : 'Preview'}
                                    </button>
                                    <label className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer flex items-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        Replace
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            disabled={isUploading}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Interactive Canvas */}
                            <div
                                ref={containerRef}
                                className="relative w-full aspect-[1.414/1] bg-gray-800 rounded-lg overflow-hidden cursor-crosshair select-none"
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                {/* Template Image */}
                                <img
                                    src={templatePreview}
                                    alt="Certificate Template"
                                    className="w-full h-full object-contain"
                                    draggable={false}
                                />

                                {/* QR Region */}
                                <div
                                    className={`absolute border-2 ${showPreview ? 'border-transparent' : 'border-violet-500 border-dashed'} cursor-move flex items-center justify-center`}
                                    style={{
                                        left: `${qrRegion.x}%`,
                                        top: `${qrRegion.y}%`,
                                        width: `${qrRegion.width}%`,
                                        height: `${qrRegion.height}%`,
                                        backgroundColor: showPreview ? 'transparent' : 'rgba(139, 92, 246, 0.2)',
                                    }}
                                    onMouseDown={(e) => handleMouseDown(e, { type: 'qr' })}
                                >
                                    {showPreview ? (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                            <div className="text-xs text-gray-400 text-center">
                                                [QR]
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-violet-400 font-medium">QR Code</span>
                                    )}
                                </div>

                                {/* Text Regions */}
                                {textRegions.map(region => (
                                    <div
                                        key={region.id}
                                        className={`absolute cursor-move ${showPreview ? '' : 'border border-emerald-500 border-dashed'}`}
                                        style={{
                                            left: `${region.x}%`,
                                            top: `${region.y}%`,
                                            transform: 'translate(-50%, -50%)',
                                            fontSize: `${region.fontSize * 0.5}px`,
                                            color: region.color,
                                            fontWeight: region.fontWeight,
                                            textAlign: region.alignment,
                                            backgroundColor: showPreview ? 'transparent' : 'rgba(16, 185, 129, 0.1)',
                                            padding: showPreview ? '0' : '2px 8px',
                                            whiteSpace: 'nowrap',
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, { type: 'text', id: region.id })}
                                    >
                                        {SAMPLE_DATA[region.field]}
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                {showPreview
                                    ? 'Showing preview with sample data'
                                    : 'Drag elements to position them. Use the panel on the right to add/configure fields.'}
                            </p>
                        </div>
                    </div>

                    {/* Controls Panel */}
                    <div className="space-y-4">
                        {/* QR Region Controls */}
                        <div className="bg-gray-900 rounded-xl p-4">
                            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <div className="w-4 h-4 bg-violet-500 rounded"></div>
                                QR Code Region
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400">X Position (%)</label>
                                    <input
                                        type="number"
                                        value={Math.round(qrRegion.x)}
                                        onChange={(e) => setQrRegion(prev => ({ ...prev, x: Number(e.target.value) }))}
                                        className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400">Y Position (%)</label>
                                    <input
                                        type="number"
                                        value={Math.round(qrRegion.y)}
                                        onChange={(e) => setQrRegion(prev => ({ ...prev, y: Number(e.target.value) }))}
                                        className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-400">Size (%)</label>
                                    <input
                                        type="range"
                                        value={qrRegion.width}
                                        onChange={(e) => {
                                            const size = Number(e.target.value)
                                            setQrRegion(prev => ({ ...prev, width: size, height: size }))
                                        }}
                                        className="w-full mt-1"
                                        min="5"
                                        max="30"
                                    />
                                    <span className="text-xs text-gray-500">{Math.round(qrRegion.width)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Text Fields */}
                        <div className="bg-gray-900 rounded-xl p-4">
                            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Type className="w-4 h-4 text-emerald-500" />
                                Text Fields
                            </h4>

                            {/* Add Field Buttons */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {TEXT_FIELD_OPTIONS.map(option => {
                                    const isAdded = textRegions.some(r => r.field === option.value)
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => !isAdded && addTextRegion(option.value)}
                                            disabled={isAdded}
                                            className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors ${isAdded
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                                                }`}
                                        >
                                            <Plus className="w-3 h-3" />
                                            {option.label}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Active Fields */}
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {textRegions.map(region => (
                                    <div key={region.id} className="bg-gray-800 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-white font-medium">
                                                {TEXT_FIELD_OPTIONS.find(o => o.value === region.field)?.label}
                                            </span>
                                            <button
                                                onClick={() => removeTextRegion(region.id)}
                                                className="p-1 text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-xs text-gray-500">Size</label>
                                                <input
                                                    type="number"
                                                    value={region.fontSize}
                                                    onChange={(e) => updateTextRegion(region.id, { fontSize: Number(e.target.value) })}
                                                    className="w-full mt-0.5 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                                                    min="8"
                                                    max="72"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Color</label>
                                                <input
                                                    type="color"
                                                    value={region.color}
                                                    onChange={(e) => updateTextRegion(region.id, { color: e.target.value })}
                                                    className="w-full mt-0.5 h-7 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Weight</label>
                                                <select
                                                    value={region.fontWeight}
                                                    onChange={(e) => updateTextRegion(region.id, { fontWeight: e.target.value as 'normal' | 'bold' })}
                                                    className="w-full mt-0.5 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                                                >
                                                    <option value="normal">Normal</option>
                                                    <option value="bold">Bold</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {textRegions.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        Click the buttons above to add text fields
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !templateUrl}
                            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Template
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
