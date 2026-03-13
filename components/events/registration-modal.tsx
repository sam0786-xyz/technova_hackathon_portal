"use client"

import { useState } from "react"
import { RegistrationField } from "@/components/admin/form-builder"
import { Loader2, X, AlertCircle, Mail, Phone } from "lucide-react"

interface RegistrationModalProps {
    isOpen: boolean
    onClose: () => void
    fields: RegistrationField[]
    onConfirm: (answers: Record<string, any>) => void
    loading: boolean
}

export function RegistrationModal({ isOpen, onClose, fields, onConfirm, loading }: RegistrationModalProps) {
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})

    if (!isOpen) return null

    const validateField = (field: RegistrationField, value: any): string | null => {
        if (field.required && (!value || value === '')) {
            return 'This field is required'
        }

        if (!value) return null

        if (field.validation) {
            switch (field.validation.rule) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (!emailRegex.test(value)) return 'Please enter a valid email address'
                    break
                case 'phone':
                    const phoneRegex = /^\d{10}$/
                    if (!phoneRegex.test(value)) return 'Please enter a valid 10-digit phone number'
                    break
                case 'min_length':
                    if (value.length < (field.validation.value || 0))
                        return `Minimum ${field.validation.value} characters required`
                    break
                case 'max_length':
                    if (value.length > (field.validation.value || 999))
                        return `Maximum ${field.validation.value} characters allowed`
                    break
                case 'min_digits':
                    const minDigitCount = value.toString().replace(/[^0-9]/g, '').length
                    if (minDigitCount < (field.validation.value || 0))
                        return `Must have at least ${field.validation.value} digits`
                    break
                case 'max_digits':
                    const maxDigitCount = value.toString().replace(/[^0-9]/g, '').length
                    if (maxDigitCount > (field.validation.value || 999))
                        return `Must have at most ${field.validation.value} digits`
                    break
                case 'exact_digits':
                    const exactDigitCount = value.toString().replace(/[^0-9]/g, '').length
                    if (exactDigitCount !== field.validation.value)
                        return `Must have exactly ${field.validation.value} digits`
                    break
            }
        }

        // Built-in type validation
        if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(value)) return 'Please enter a valid email address'
        }
        if (field.type === 'phone') {
            const phoneRegex = /^\d{10}$/
            if (!phoneRegex.test(value)) return 'Please enter a valid 10-digit phone number'
        }

        return null
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const newErrors: Record<string, string> = {}
        fields.forEach(field => {
            const error = validateField(field, answers[field.id])
            if (error) newErrors[field.id] = error
        })

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        onConfirm(answers)
    }

    const handleChange = (fieldId: string, value: any) => {
        setAnswers({ ...answers, [fieldId]: value })
        // Clear error when user starts typing
        if (errors[fieldId]) {
            setErrors({ ...errors, [fieldId]: '' })
        }
    }

    const getInputType = (field: RegistrationField) => {
        if (field.type === 'email') return 'email'
        if (field.type === 'phone') return 'tel'
        return field.type
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold text-lg">Complete Registration</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                        {fields.map((field) => (
                            <div key={field.id} className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                    {field.type === 'email' && <Mail className="w-4 h-4 text-cyan-500" />}
                                    {field.type === 'phone' && <Phone className="w-4 h-4 text-orange-500" />}
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>

                                {(field.type === 'text' || field.type === 'email' || field.type === 'phone') && (
                                    <input
                                        type={getInputType(field)}
                                        required={field.required}
                                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors[field.id] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        placeholder={
                                            field.type === 'email' ? 'email@example.com' :
                                                field.type === 'phone' ? '10-digit phone number' :
                                                    `Enter ${field.label.toLowerCase()}`
                                        }
                                        maxLength={field.type === 'phone' ? 10 : undefined}
                                    />
                                )}

                                {field.type === 'number' && (
                                    <input
                                        type="number"
                                        required={field.required}
                                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors[field.id] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        placeholder="Enter number"
                                    />
                                )}

                                {field.type === 'select' && (
                                    <select
                                        required={field.required}
                                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white ${errors[field.id] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select an option</option>
                                        {field.options?.map((opt, i) => (
                                            <option key={i} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                )}

                                {field.type === 'checkbox' && (
                                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            required={field.required}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            onChange={(e) => handleChange(field.id, e.target.checked)}
                                        />
                                        <span className="text-sm text-gray-700">Yes, I agree / confirm</span>
                                    </label>
                                )}

                                {/* Error Message */}
                                {errors[field.id] && (
                                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors[field.id]}
                                    </p>
                                )}

                                {/* Validation Hint */}
                                {field.validation && !errors[field.id] && (
                                    <p className="text-gray-400 text-xs mt-1">
                                        {field.validation.rule === 'min_length' && `Min ${field.validation.value} characters`}
                                        {field.validation.rule === 'max_length' && `Max ${field.validation.value} characters`}
                                        {field.validation.rule === 'min_digits' && `Minimum ${field.validation.value} digits`}
                                        {field.validation.rule === 'max_digits' && `Maximum ${field.validation.value} digits`}
                                        {field.validation.rule === 'exact_digits' && `Must be exactly ${field.validation.value} digits`}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Confirm & Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
