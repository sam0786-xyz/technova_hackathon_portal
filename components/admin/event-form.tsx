"use client"

import { useState, useRef, MouseEvent, useEffect } from "react"
import { getClubMembers } from "@/lib/actions/clubs"
import { formatDate, formatDateRange, formatTime, toDateTimeLocalString } from "@/lib/utils"
import { createEvent, updateEvent } from "@/lib/actions/events"
import { FormBuilder, RegistrationField } from "./form-builder"
import { Loader2, Move, CalendarDays } from "lucide-react"
import { Toast, useToast } from "@/components/ui/toast"

interface EventFormProps {
    clubs: any[]
    event?: any
}

export function EventForm({ clubs, event }: EventFormProps) {
    const [loading, setLoading] = useState(false)
    const [isVirtual, setIsVirtual] = useState(event?.is_virtual || false)
    const [isMultiDay, setIsMultiDay] = useState(event?.is_multi_day || false)
    const [selectedClubId, setSelectedClubId] = useState<string>(event?.club_id || "")
    const [pocMembers, setPocMembers] = useState<any[]>([])
    const [loadingMembers, setLoadingMembers] = useState(false)
    const [selectedPoc, setSelectedPoc] = useState<string>(event?.poc_name || "")
    const { toast, showToast, hideToast } = useToast()

    // Date/time controlled states for proper syncing
    const [startTime, setStartTime] = useState(event?.start_time ? toDateTimeLocalString(event.start_time) : "")
    const [endTime, setEndTime] = useState(event?.end_time ? toDateTimeLocalString(event.end_time) : "")
    const [startDate, setStartDate] = useState(event?.start_time ? toDateTimeLocalString(event.start_time).slice(0, 10) : "")
    const [endDate, setEndDate] = useState(event?.end_time ? toDateTimeLocalString(event.end_time).slice(0, 10) : "")
    const [dailyStartTime, setDailyStartTime] = useState(event?.daily_start_time?.slice(0, 5) || "")
    const [dailyEndTime, setDailyEndTime] = useState(event?.daily_end_time?.slice(0, 5) || "")
    const [excludedDates, setExcludedDates] = useState<string[]>(event?.excluded_dates || [])

    useEffect(() => {
        if (!selectedClubId) {
            setPocMembers([])
            return
        }

        const fetchMembers = async () => {
            setLoadingMembers(true)
            try {
                const members = await getClubMembers(selectedClubId)
                setPocMembers(members)
                // If editing and POC exists in members, keep it selected
                if (event?.poc_name && members.some((m: any) => m.name === event.poc_name)) {
                    setSelectedPoc(event.poc_name)
                }
            } catch (error) {
                console.error("Failed to fetch members", error)
            } finally {
                setLoadingMembers(false)
            }
        }
        fetchMembers()
    }, [selectedClubId, event?.poc_name])

    // Banner position state
    const initialPos = event?.banner_position || "center"
    const isCustom = initialPos.includes('%') || !['center', 'top', 'bottom', 'left', 'right'].includes(initialPos)

    const [bannerPosMode, setBannerPosMode] = useState(isCustom ? 'custom' : initialPos)
    const [bannerPosValue, setBannerPosValue] = useState(initialPos)
    const [posX, setPosX] = useState(isCustom ? parseInt(initialPos.split(' ')[0]) || 50 : 50)
    const [posY, setPosY] = useState(isCustom && initialPos.split(' ').length > 1 ? parseInt(initialPos.split(' ')[1]) || 50 : 50)

    const [previewUrl, setPreviewUrl] = useState<string | null>(event?.banner || null)
    const positionRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    const [questions, setQuestions] = useState<RegistrationField[]>(() => {
        if (!event?.registration_fields) return []
        try {
            if (typeof event.registration_fields === 'string') {
                return JSON.parse(event.registration_fields)
            }
            return Array.isArray(event.registration_fields) ? event.registration_fields : []
        } catch (e) {
            console.error('Failed to parse registration_fields:', e)
            return []
        }
    })

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            formData.set('registration_fields', JSON.stringify(questions))
            let result
            if (event) {
                formData.set('id', event.id)
                result = await updateEvent(formData)
            } else {
                result = await createEvent(formData)
            }

            // Show success toast
            if (result?.success) {
                showToast(result.message, "success")
                // Redirect after a short delay so user can see the toast
                setTimeout(() => {
                    window.location.href = "/admin/events"
                }, 1500)
            }
        } catch (error: any) {
            console.error("Event form error:", error)
            const errorMessage = error?.message || "Something went wrong. Please try again."
            showToast(errorMessage, "error")
            setLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            setBannerPosMode('custom')
        }
    }

    const handlePositionDrag = (e: MouseEvent<HTMLDivElement>) => {
        if (!positionRef.current) return
        const rect = positionRef.current.getBoundingClientRect()
        const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
        const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))
        setPosX(Math.round(x))
        setPosY(Math.round(y))
        const newValue = `${Math.round(x)}% ${Math.round(y)}%`
        setBannerPosValue(newValue)
    }

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        setIsDragging(true)
        handlePositionDrag(e)
    }

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (isDragging) handlePositionDrag(e)
    }

    const handleMouseUp = () => setIsDragging(false)

    return (
        <form action={handleSubmit} className="space-y-8">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl space-y-6">
                <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-3">Basic Details</h2>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Event Title</label>
                    <input name="title" required type="text" defaultValue={event?.title} className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50" placeholder="e.g. Technova Hackathon 2025" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Hosting Club</label>
                        <select name="club_id" required defaultValue={event?.club_id || ""} onChange={(e) => setSelectedClubId(e.target.value)} className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none">
                            <option value="" disabled>Select Club</option>
                            {clubs.map((club: any) => (
                                <option key={club.id} value={club.id}>{club.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Co-Hosting Club (Optional)</label>
                        <select name="co_host_club_id" defaultValue={event?.co_host_club_id || "none"} className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none">
                            <option value="none">None</option>
                            {clubs.map((club: any) => (
                                <option key={club.id} value={club.id}>{club.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Point of Contact (POC) */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Point of Contact (POC)</label>
                    <select
                        name="poc_name"
                        value={selectedPoc}
                        onChange={(e) => setSelectedPoc(e.target.value)}
                        className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                        disabled={!selectedClubId || loadingMembers}
                    >
                        <option value="">
                            {loadingMembers ? 'Loading members...' : (!selectedClubId ? 'Select hosting club first' : 'Select POC')}
                        </option>
                        {pocMembers.map((m: any) => (
                            <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea name="description" required defaultValue={event?.description} className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 h-32 focus:border-blue-500 focus:outline-none" placeholder="Event details..." />
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-300">Banner Image</label>
                    <input name="banner_file" type="file" accept="image/*" onChange={handleFileChange} className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer" />
                    <p className="text-xs text-gray-400">Recommended banner size is 1000px × 300px</p>
                    {event?.banner && <input type="hidden" name="banner" value={event.banner} />}

                    {previewUrl && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Move className="w-4 h-4" />
                                <span>Click on the image to set focus point for cropping</span>
                            </div>
                            <div
                                ref={positionRef}
                                className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10 cursor-crosshair select-none"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={previewUrl} alt="Banner Preview" className="w-full h-full object-cover" style={{ objectPosition: bannerPosValue }} />

                                {/* Focus Crosshair */}
                                <div
                                    className="absolute w-6 h-6 border-2 border-blue-500 rounded-full bg-blue-500/30 -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                    style={{ left: `${posX}%`, top: `${posY}%` }}
                                >
                                    <div className="absolute inset-1 rounded-full bg-blue-500" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-400">Position:</span>
                                <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 font-mono">{bannerPosValue}</span>
                            </div>
                        </div>
                    )}
                    <input type="hidden" name="banner_position" value={bannerPosValue} />
                </div>

                {/* Virtual Event */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <input type="checkbox" name="is_virtual" value="true" id="is_virtual" defaultChecked={event?.is_virtual} onChange={(e) => setIsVirtual(e.target.checked)} className="w-5 h-5 rounded border-white/20 bg-black text-blue-600 focus:ring-blue-500/50" />
                    <label htmlFor="is_virtual" className="font-medium text-white cursor-pointer">This is a Virtual Event</label>
                </div>

                {isVirtual && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Meeting Link</label>
                        <input name="meeting_link" type="url" defaultValue={event?.meeting_link} className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" placeholder="e.g. Google Meet or Zoom Link" />
                    </div>
                )}

                {/* Multi-Day Event Toggle */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <input type="checkbox" name="is_multi_day" value="true" id="is_multi_day" defaultChecked={event?.is_multi_day} onChange={(e) => setIsMultiDay(e.target.checked)} className="w-5 h-5 rounded border-white/20 bg-black text-purple-600 focus:ring-purple-500/50" />
                    <label htmlFor="is_multi_day" className="font-medium text-white cursor-pointer flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-purple-400" />
                        Multi-Day Event (same daily timing)
                    </label>
                </div>

                {isMultiDay ? (
                    /* Multi-Day Event: Date Range + Daily Times */
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                                <input
                                    name="start_date"
                                    required
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                                <input
                                    name="end_date"
                                    required
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Daily Start Time</label>
                                <input
                                    name="daily_start_time"
                                    required
                                    type="time"
                                    value={dailyStartTime}
                                    onChange={(e) => setDailyStartTime(e.target.value)}
                                    className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Daily End Time</label>
                                <input
                                    name="daily_end_time"
                                    required
                                    type="time"
                                    value={dailyEndTime}
                                    onChange={(e) => setDailyEndTime(e.target.value)}
                                    className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Excluded Dates / Holidays */}
                        <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-500/20">
                            <label className="block text-sm font-medium text-amber-300 mb-3">
                                Excluded Dates / Holidays (Optional)
                            </label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="date"
                                    id="new-excluded-date"
                                    min={startDate}
                                    max={endDate}
                                    className="flex-1 p-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const input = document.getElementById('new-excluded-date') as HTMLInputElement
                                        const date = input?.value
                                        if (date && !excludedDates.includes(date)) {
                                            setExcludedDates([...excludedDates, date].sort())
                                            input.value = ''
                                        }
                                    }}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
                                >
                                    Add Holiday
                                </button>
                            </div>
                            {excludedDates.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {excludedDates.map(date => (
                                        <span key={date} className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-sm text-amber-300">
                                            {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            <button
                                                type="button"
                                                onClick={() => setExcludedDates(excludedDates.filter(d => d !== date))}
                                                className="text-amber-400 hover:text-red-400 font-bold"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500">No holidays added. Students can check in on all days.</p>
                            )}
                            <input type="hidden" name="excluded_dates" value={JSON.stringify(excludedDates)} />
                        </div>

                        <p className="text-xs text-gray-400">The event will occur daily from the daily start time to the daily end time, between the start and end dates (excluding holidays).</p>
                    </div>
                ) : (
                    /* Single-Day Event: Standard datetime inputs */
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                            <input
                                name="start_time"
                                required
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                            <input
                                name="end_time"
                                required
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Venue {isVirtual ? "(Physical Location for Hybrid)" : ""}</label>
                    <input name="venue" required={!isVirtual} type="text" defaultValue={event?.venue} className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" placeholder={isVirtual ? "Optional if purely online" : "e.g. Auditorium"} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Capacity</label>
                        <input name="capacity" required type="number" defaultValue={event?.capacity} className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" placeholder="100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Price (₹)</label>
                        <input name="price" required type="number" defaultValue={event?.price || 0} className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select name="status" className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none" defaultValue={event?.status || "draft"}>
                        <option value="draft">Draft</option>
                        <option value="live">Live (Public)</option>
                    </select>
                </div>

                {/* XP System Fields */}
                <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Event Type <span className="text-purple-400 text-xs">(XP Reward)</span>
                        </label>
                        <select name="event_type" className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none" defaultValue={event?.event_type || "workshop"}>
                            <option value="talk_seminar">Talk / Seminar (50 XP)</option>
                            <option value="workshop">Workshop (80 XP)</option>
                            <option value="competition">Competition (100 XP)</option>
                            <option value="hackathon">Hackathon (150 XP)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Difficulty Level <span className="text-purple-400 text-xs">(Multiplier)</span>
                        </label>
                        <select name="difficulty_level" className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none" defaultValue={event?.difficulty_level || "easy"}>
                            <option value="easy">Easy (×1.0) - No prerequisite</option>
                            <option value="moderate">Moderate (×1.3) - Basic prerequisite</option>
                            <option value="hard">Hard (×1.6) - Strong prerequisite</option>
                            <option value="elite">Elite (×2.0) - Advanced</option>
                        </select>
                    </div>
                    <p className="col-span-2 text-xs text-gray-400">XP = Base XP × Duration Multiplier × Difficulty Multiplier</p>
                </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl space-y-6">
                <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-3">Custom Questions</h2>
                <p className="text-sm text-gray-400">Add questions for registration. Toggle required to make them mandatory.</p>
                <FormBuilder fields={questions} onChange={setQuestions} />
            </div>

            <div className="flex justify-end gap-4">
                <button disabled={loading} type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-3 rounded-xl font-medium disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {event ? "Update Event" : "Create Event"}
                </button>
            </div>

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </form>
    )
}
