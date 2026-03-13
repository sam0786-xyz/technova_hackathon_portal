"use client"

import { useState } from "react"
import { Plus, Trash2, X, Mail, Phone, FileText, Hash, CheckCircle, Circle } from "lucide-react"

export type QuestionType = 'text' | 'number' | 'select' | 'checkbox' | 'email' | 'phone'

export type ValidationRule = 'none' | 'email' | 'phone' | 'min_length' | 'max_length' | 'min_digits' | 'max_digits' | 'exact_digits'

export interface RegistrationField {
    id: string
    type: QuestionType
    label: string
    required: boolean
    options?: string[]
    validation?: {
        rule: ValidationRule
        value?: number
    }
}

interface FormBuilderProps {
    fields: RegistrationField[]
    onChange: (fields: RegistrationField[]) => void
}

export function FormBuilder({ fields, onChange }: FormBuilderProps) {
    const addField = (type: QuestionType) => {
        const newField: RegistrationField = {
            id: crypto.randomUUID(),
            type,
            label: "",
            required: true,
            options: type === 'select' ? ["Option 1"] : undefined,
            validation: type === 'email' ? { rule: 'email' } : type === 'phone' ? { rule: 'phone' } : undefined
        }
        onChange([...fields, newField])
    }

    const updateField = (id: string, updates: Partial<RegistrationField>) => {
        onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f))
    }

    const removeField = (id: string) => {
        onChange(fields.filter(f => f.id !== id))
    }

    const addOption = (fieldId: string) => {
        const field = fields.find(f => f.id === fieldId)
        if (field && field.options) {
            updateField(fieldId, { options: [...field.options, `Option ${field.options.length + 1}`] })
        }
    }

    const updateOption = (fieldId: string, index: number, value: string) => {
        const field = fields.find(f => f.id === fieldId)
        if (field && field.options) {
            const newOptions = [...field.options]
            newOptions[index] = value
            updateField(fieldId, { options: newOptions })
        }
    }

    const removeOption = (fieldId: string, index: number) => {
        const field = fields.find(f => f.id === fieldId)
        if (field && field.options && field.options.length > 1) {
            const newOptions = field.options.filter((_, i) => i !== index)
            updateField(fieldId, { options: newOptions })
        }
    }

    const getValidationLabel = (field: RegistrationField) => {
        if (!field.validation) return null
        switch (field.validation.rule) {
            case 'email': return 'Valid Email'
            case 'phone': return '10 Digit Phone'
            case 'min_length': return `Min ${field.validation.value} chars`
            case 'max_length': return `Max ${field.validation.value} chars`
            case 'min_digits': return `Min ${field.validation.value} digits`
            case 'max_digits': return `Max ${field.validation.value} digits`
            case 'exact_digits': return `Exactly ${field.validation.value} digits`
            default: return null
        }
    }

    return (
        <div className="space-y-4">
            {/* Add Field Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button type="button" onClick={() => addField('text')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 flex items-center gap-2 transition-colors">
                    <FileText className="w-4 h-4 text-blue-400" /> Text
                </button>
                <button type="button" onClick={() => addField('number')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 flex items-center gap-2 transition-colors">
                    <Hash className="w-4 h-4 text-green-400" /> Number
                </button>
                <button type="button" onClick={() => addField('email')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 flex items-center gap-2 transition-colors">
                    <Mail className="w-4 h-4 text-cyan-400" /> Email
                </button>
                <button type="button" onClick={() => addField('phone')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 flex items-center gap-2 transition-colors">
                    <Phone className="w-4 h-4 text-orange-400" /> Phone
                </button>
                <button type="button" onClick={() => addField('select')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4 text-purple-400" /> Dropdown
                </button>
                <button type="button" onClick={() => addField('checkbox')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4 text-yellow-400" /> Checkbox
                </button>
            </div>

            {fields.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed border-white/10 rounded-2xl text-gray-500">
                    No custom questions yet. Add one above.
                </div>
            )}

            {/* Field Cards */}
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="bg-white/5 p-5 rounded-2xl border border-white/10 relative group">
                        <button
                            type="button"
                            onClick={() => removeField(field.id)}
                            className="absolute top-3 right-3 p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid gap-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Question Label</label>
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                                        placeholder="e.g. T-Shirt Size"
                                        className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div className="w-28">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Type</label>
                                    <div className={`p-3 bg-black/30 border rounded-xl capitalize text-sm font-medium flex items-center gap-2 ${field.type === 'text' ? 'border-blue-500/30 text-blue-400' :
                                        field.type === 'number' ? 'border-green-500/30 text-green-400' :
                                            field.type === 'email' ? 'border-cyan-500/30 text-cyan-400' :
                                                field.type === 'phone' ? 'border-orange-500/30 text-orange-400' :
                                                    field.type === 'select' ? 'border-purple-500/30 text-purple-400' :
                                                        'border-yellow-500/30 text-yellow-400'
                                        }`}>
                                        {field.type === 'email' && <Mail className="w-4 h-4" />}
                                        {field.type === 'phone' && <Phone className="w-4 h-4" />}
                                        {field.type}
                                    </div>
                                </div>
                            </div>

                            {/* Required/Optional Buttons - CLEARLY VISIBLE */}
                            <div className="flex flex-wrap items-center gap-3">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Response:</label>
                                <div className="flex rounded-xl border border-white/10 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => updateField(field.id, { required: true })}
                                        className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-all ${field.required
                                            ? 'bg-red-600 text-white'
                                            : 'bg-black/30 text-gray-400 hover:bg-white/5'
                                            }`}
                                    >
                                        {field.required ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                        Required
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateField(field.id, { required: false })}
                                        className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-all ${!field.required
                                            ? 'bg-green-600 text-white'
                                            : 'bg-black/30 text-gray-400 hover:bg-white/5'
                                            }`}
                                    >
                                        {!field.required ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                        Optional
                                    </button>
                                </div>

                                {/* Validation Badge */}
                                {getValidationLabel(field) && (
                                    <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-xs text-cyan-400">
                                        ✓ {getValidationLabel(field)}
                                    </span>
                                )}
                            </div>

                            {/* Validation Options for Text/Number */}
                            {(field.type === 'text' || field.type === 'number') && (
                                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-3 block">Validation Constraint</label>
                                    <div className="flex flex-wrap gap-3">
                                        <select
                                            value={field.validation?.rule || 'none'}
                                            onChange={(e) => updateField(field.id, {
                                                validation: e.target.value === 'none' ? undefined : {
                                                    rule: e.target.value as ValidationRule,
                                                    value: field.validation?.value || (field.type === 'text' ? 3 : 0)
                                                }
                                            })}
                                            className="px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                                        >
                                            <option value="none">No Constraint</option>
                                            {field.type === 'text' && (
                                                <>
                                                    <option value="min_length">Minimum Length</option>
                                                    <option value="max_length">Maximum Length</option>
                                                </>
                                            )}
                                            {field.type === 'number' && (
                                                <>
                                                    <option value="exact_digits">Exact Digits (e.g. 10 for phone)</option>
                                                    <option value="min_digits">Minimum Digits</option>
                                                    <option value="max_digits">Maximum Digits</option>
                                                </>
                                            )}
                                        </select>
                                        {field.validation && ['min_length', 'max_length', 'min_digits', 'max_digits', 'exact_digits'].includes(field.validation.rule) && (
                                            <input
                                                type="number"
                                                value={field.validation.value || 0}
                                                onChange={(e) => updateField(field.id, { validation: { ...field.validation!, value: parseInt(e.target.value) } })}
                                                className="w-24 px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                                                placeholder="Value"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Options for Select */}
                            {field.type === 'select' && (
                                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-3 block">Options</label>
                                    <div className="space-y-2">
                                        {field.options?.map((option, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => updateOption(field.id, idx, e.target.value)}
                                                    className="flex-1 p-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(field.id, idx)}
                                                    className="p-2 text-gray-500 hover:text-red-400 disabled:opacity-30"
                                                    disabled={field.options!.length <= 1}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addOption(field.id)}
                                            className="text-sm text-purple-400 font-medium hover:text-purple-300 flex items-center gap-1 mt-2"
                                        >
                                            <Plus className="w-3 h-3" /> Add Option
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
