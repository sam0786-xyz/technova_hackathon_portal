'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, GraduationCap, BookOpen, Hash, Phone, Sparkles, ArrowRight, Loader2 } from "lucide-react"

const COURSES = [
    { value: "CSE", label: "Computer Science & Engineering" },
    { value: "CSE-AIML", label: "CSE (AI & Machine Learning)" },
    { value: "CSE-DS", label: "CSE (Data Science)" },
    { value: "CSE-IOT", label: "CSE (Internet of Things)" },
    { value: "CSE-CS", label: "CSE (Cyber Security)" },
    { value: "IT", label: "Information Technology" },
    { value: "ECE", label: "Electronics & Communication" },
    { value: "EE", label: "Electrical Engineering" },
    { value: "ME", label: "Mechanical Engineering" },
    { value: "CE", label: "Civil Engineering" },
    { value: "BCA", label: "Bachelor of Computer Applications" },
    { value: "MCA", label: "Master of Computer Applications" },
    { value: "Other", label: "Other" },
]

const SECTIONS = Array.from({ length: 19 }, (_, i) => String.fromCharCode(65 + i))

const SKILL_SUGGESTIONS = [
    "Python", "JavaScript", "React", "Node.js", "Java", "C++", "Machine Learning",
    "Data Science", "AWS", "Docker", "UI/UX Design", "Figma", "Flutter", "Android",
    "iOS", "Blockchain", "Cybersecurity", "DevOps", "SQL", "MongoDB"
]

interface OnboardingFormProps {
    userId: string
    userName?: string
}

export function OnboardingForm({ userId, userName }: OnboardingFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [skills, setSkills] = useState<string[]>([])
    const [skillInput, setSkillInput] = useState("")
    const [systemIdError, setSystemIdError] = useState("")
    const router = useRouter()

    function validateSystemId(value: string): boolean {
        if (value.length !== 10) {
            setSystemIdError("System ID must be exactly 10 digits")
            return false
        }
        if (!/^\d{10}$/.test(value)) {
            setSystemIdError("System ID must contain only digits")
            return false
        }
        setSystemIdError("")
        return true
    }

    function addSkill(skill: string) {
        const trimmed = skill.trim()
        if (trimmed && !skills.includes(trimmed) && skills.length < 10) {
            setSkills([...skills, trimmed])
            setSkillInput("")
        }
    }

    function removeSkill(skill: string) {
        setSkills(skills.filter(s => s !== skill))
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const systemId = formData.get("system_id") as string

        // Validate system ID is exactly 10 digits
        if (!validateSystemId(systemId)) {
            setLoading(false)
            return
        }

        const data = {
            system_id: systemId,
            year: parseInt(formData.get("year") as string),
            course: formData.get("course"),
            section: formData.get("section"),
            mobile: formData.get("mobile") || null,
            skills: skills,
            userId
        }

        try {
            const res = await fetch("/api/user/onboarding", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            })

            if (!res.ok) {
                const msg = await res.text()
                throw new Error(msg || "Failed to update profile")
            }

            // Refresh session and redirect to dashboard
            router.refresh()
            router.push("/dashboard")
        } catch (err: unknown) {
            const error = err as Error
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* System ID */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Hash className="w-4 h-4 text-blue-500" />
                    System ID <span className="text-red-400">*</span>
                </label>
                <input
                    name="system_id"
                    required
                    pattern="\d{10}"
                    maxLength={10}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        e.target.value = value
                        if (value.length === 10) {
                            validateSystemId(value)
                        } else if (value.length > 0) {
                            setSystemIdError(`${10 - value.length} more digits needed`)
                        } else {
                            setSystemIdError("")
                        }
                    }}
                    placeholder="e.g. 2021001234"
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-mono tracking-wider"
                />
                {systemIdError && (
                    <p className="text-xs text-red-400">{systemIdError}</p>
                )}
                <p className="text-xs text-gray-500">Must be exactly 10 digits (found on your ID card)</p>
            </div>

            {/* Year & Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <GraduationCap className="w-4 h-4 text-blue-500" />
                        Year <span className="text-red-400">*</span>
                    </label>
                    <select
                        name="year"
                        required
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-zinc-900">Select Year</option>
                        <option value="1" className="bg-zinc-900">1st Year</option>
                        <option value="2" className="bg-zinc-900">2nd Year</option>
                        <option value="3" className="bg-zinc-900">3rd Year</option>
                        <option value="4" className="bg-zinc-900">4th Year</option>
                        <option value="5" className="bg-zinc-900">5th Year (Integrated)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        Course <span className="text-red-400">*</span>
                    </label>
                    <select
                        name="course"
                        required
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-zinc-900">Select Course</option>
                        {COURSES.map(course => (
                            <option key={course.value} value={course.value} className="bg-zinc-900">
                                {course.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Section & Mobile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <User className="w-4 h-4 text-blue-500" />
                        Section <span className="text-red-400">*</span>
                    </label>
                    <select
                        name="section"
                        required
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-zinc-900">Select Section</option>
                        {SECTIONS.map(char => (
                            <option key={char} value={char} className="bg-zinc-900">{char}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Phone className="w-4 h-4 text-blue-500" />
                        Mobile Number
                    </label>
                    <input
                        name="mobile"
                        type="tel"
                        placeholder="+91 9876543210"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Skills */}
            <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Skills & Interests
                </label>

                {/* Skill Input */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                addSkill(skillInput)
                            }
                        }}
                        placeholder="Type a skill and press Enter"
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => addSkill(skillInput)}
                        className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-600/30 transition-colors"
                    >
                        Add
                    </button>
                </div>

                {/* Selected Skills */}
                {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {skills.map(skill => (
                            <span
                                key={skill}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm text-blue-300"
                            >
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => removeSkill(skill)}
                                    className="w-4 h-4 rounded-full bg-blue-500/30 hover:bg-red-500/50 flex items-center justify-center text-xs transition-colors"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Skill Suggestions */}
                <div className="flex flex-wrap gap-2">
                    {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 8).map(skill => (
                        <button
                            key={skill}
                            type="button"
                            onClick={() => addSkill(skill)}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                        >
                            + {skill}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500">These help you find teammates in Buddy Finder</p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="group w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Setting up your account...
                    </>
                ) : (
                    <>
                        Complete Setup
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
        </form>
    )
}
