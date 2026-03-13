'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, GripVertical, Star, ChevronDown } from 'lucide-react'
import type { FeedbackQuestion, FeedbackFormWithMeta } from '@/lib/actions/feedback'

interface Props {
    isMultiDay: boolean
    existingForms: FeedbackFormWithMeta[]
    editingForm: FeedbackFormWithMeta | null
    onSave: (data: {
        title: string
        dayNumber: number | null
        releaseMode: 'automatic' | 'manual'
        autoCloseDays: number | null
        questions: FeedbackQuestion[]
    }) => void
    onCancel: () => void
}

const QUESTION_TYPES = [
    { value: 'text', label: 'Short Text', placeholder: 'Single line text input' },
    { value: 'textarea', label: 'Long Text', placeholder: 'Multi-line text area' },
    { value: 'rating', label: 'Rating (1-5 Stars)', placeholder: 'Star rating' },
    { value: 'select', label: 'Dropdown', placeholder: 'Single selection dropdown' },
    { value: 'radio', label: 'Multiple Choice', placeholder: 'Single selection from options' },
    { value: 'checkbox', label: 'Checkboxes', placeholder: 'Multiple selections allowed' },
] as const

export function FeedbackFormBuilder({ isMultiDay, existingForms, editingForm, onSave, onCancel }: Props) {
    const [title, setTitle] = useState(editingForm?.title || 'Event Feedback')
    const [dayNumber, setDayNumber] = useState<number | null>(editingForm?.day_number ?? null)
    const [releaseMode, setReleaseMode] = useState<'automatic' | 'manual'>(editingForm?.release_mode || 'automatic')
    const [autoCloseDays, setAutoCloseDays] = useState<number | null>(editingForm?.auto_close_after_days ?? null)
    const [questions, setQuestions] = useState<FeedbackQuestion[]>(
        editingForm?.questions?.map((q: any, i: number) => ({
            id: q.id,
            question_type: q.question_type,
            label: q.label,
            placeholder: q.placeholder || '',
            options: q.options || [],
            is_required: q.is_required ?? true,
            order_index: i
        })) || [
            { question_type: 'rating', label: 'How would you rate this event overall?', is_required: true, order_index: 0 },
            { question_type: 'textarea', label: 'What did you like most about this event?', is_required: true, order_index: 1 },
            { question_type: 'textarea', label: 'How can we improve future events?', is_required: false, order_index: 2 }
        ]
    )
    const [saving, setSaving] = useState(false)

    // Get available day numbers (not already used)
    const usedDays = existingForms.filter(f => f.id !== editingForm?.id).map(f => f.day_number)
    const availableDays = [null, 1, 2, 3, 4, 5].filter(d => d === null || !usedDays.includes(d))

    function addQuestion() {
        setQuestions([
            ...questions,
            {
                question_type: 'text',
                label: '',
                is_required: true,
                order_index: questions.length
            }
        ])
    }

    function removeQuestion(index: number) {
        setQuestions(questions.filter((_, i) => i !== index))
    }

    function updateQuestion(index: number, field: keyof FeedbackQuestion, value: any) {
        setQuestions(questions.map((q, i) => i === index ? { ...q, [field]: value } : q))
    }

    function addOption(questionIndex: number) {
        const q = questions[questionIndex]
        const options = q.options || []
        updateQuestion(questionIndex, 'options', [
            ...options,
            { value: `option_${options.length + 1}`, label: '' }
        ])
    }

    function updateOption(questionIndex: number, optionIndex: number, label: string) {
        const q = questions[questionIndex]
        const options = [...(q.options || [])]
        options[optionIndex] = { ...options[optionIndex], label, value: label.toLowerCase().replace(/\s+/g, '_') }
        updateQuestion(questionIndex, 'options', options)
    }

    function removeOption(questionIndex: number, optionIndex: number) {
        const q = questions[questionIndex]
        updateQuestion(questionIndex, 'options', (q.options || []).filter((_, i) => i !== optionIndex))
    }

    function moveQuestion(index: number, direction: 'up' | 'down') {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) return
        const newQuestions = [...questions]
        const swapIndex = direction === 'up' ? index - 1 : index + 1
        const temp = newQuestions[index]
        newQuestions[index] = newQuestions[swapIndex]
        newQuestions[swapIndex] = temp
        setQuestions(newQuestions.map((q, i) => ({ ...q, order_index: i })))
    }

    async function handleSubmit() {
        if (!title.trim()) {
            alert('Please enter a form title')
            return
        }
        if (questions.length === 0) {
            alert('Please add at least one question')
            return
        }
        if (questions.some(q => !q.label.trim())) {
            alert('Please fill in all question labels')
            return
        }

        // Validate options for select/radio/checkbox
        for (const q of questions) {
            if (['select', 'radio', 'checkbox'].includes(q.question_type)) {
                if (!q.options || q.options.length < 2) {
                    alert(`Question "${q.label}" needs at least 2 options`)
                    return
                }
                if (q.options.some(o => !o.label.trim())) {
                    alert(`Please fill in all options for "${q.label}"`)
                    return
                }
            }
        }

        setSaving(true)
        try {
            await onSave({
                title,
                dayNumber,
                releaseMode,
                autoCloseDays,
                questions: questions.map((q, i) => ({ ...q, order_index: i }))
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold">
                    {editingForm ? 'Edit Feedback Form' : 'Create Feedback Form'}
                </h3>
            </div>

            {/* Form Settings */}
            <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Event Feedback"
                        />
                    </div>

                    {isMultiDay && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Day (for multi-day events)</label>
                            <select
                                value={dayNumber ?? ''}
                                onChange={(e) => setDayNumber(e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                                <option value="">General (all days)</option>
                                {[1, 2, 3, 4, 5].map(d => (
                                    <option key={d} value={d} disabled={usedDays.includes(d)}>
                                        Day {d} {usedDays.includes(d) ? '(exists)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Release Mode</label>
                        <select
                            value={releaseMode}
                            onChange={(e) => setReleaseMode(e.target.value as any)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="automatic">Automatic (when event ends)</option>
                            <option value="manual">Manual (you release it)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Close After</label>
                        <select
                            value={autoCloseDays ?? ''}
                            onChange={(e) => setAutoCloseDays(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="">Never (manually close)</option>
                            <option value="3">3 days after release</option>
                            <option value="7">7 days after release</option>
                            <option value="14">14 days after release</option>
                            <option value="30">30 days after release</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium">Questions</h4>
                    <button
                        onClick={addQuestion}
                        className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add Question
                    </button>
                </div>

                {questions.map((question, index) => (
                    <div key={index} className="border rounded-xl p-4 bg-white space-y-3">
                        <div className="flex items-start gap-3">
                            {/* Drag handle placeholder */}
                            <div className="flex flex-col gap-1 pt-2">
                                <button
                                    onClick={() => moveQuestion(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                >
                                    <ChevronDown className="w-4 h-4 rotate-180" />
                                </button>
                                <button
                                    onClick={() => moveQuestion(index, 'down')}
                                    disabled={index === questions.length - 1}
                                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 space-y-3">
                                {/* Question type and label */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <select
                                        value={question.question_type}
                                        onChange={(e) => updateQuestion(index, 'question_type', e.target.value)}
                                        className="px-3 py-2 border rounded-lg text-sm"
                                    >
                                        {QUESTION_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={question.label}
                                            onChange={(e) => updateQuestion(index, 'label', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                            placeholder="Enter question..."
                                        />
                                    </div>
                                </div>

                                {/* Options for select/radio/checkbox */}
                                {['select', 'radio', 'checkbox'].includes(question.question_type) && (
                                    <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                                        <p className="text-xs text-gray-500 font-medium">Options</p>
                                        {(question.options || []).map((opt, optIndex) => (
                                            <div key={optIndex} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={opt.label}
                                                    onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                                    className="flex-1 px-2 py-1 border rounded text-sm"
                                                    placeholder={`Option ${optIndex + 1}`}
                                                />
                                                <button
                                                    onClick={() => removeOption(index, optIndex)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addOption(index)}
                                            className="text-xs text-purple-600 hover:text-purple-700"
                                        >
                                            + Add option
                                        </button>
                                    </div>
                                )}

                                {/* Rating preview */}
                                {question.question_type === 'rating' && (
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <Star key={n} className="w-5 h-5 fill-current" />
                                        ))}
                                        <span className="text-xs text-gray-400 ml-2">1-5 star rating</span>
                                    </div>
                                )}

                                {/* Required toggle */}
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={question.is_required}
                                        onChange={(e) => updateQuestion(index, 'is_required', e.target.checked)}
                                        className="rounded text-purple-600"
                                    />
                                    Required
                                </label>
                            </div>

                            {/* Delete button */}
                            <button
                                onClick={() => removeQuestion(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {questions.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 mb-2">No questions yet</p>
                        <button
                            onClick={addQuestion}
                            className="text-purple-600 hover:text-purple-700"
                        >
                            Add your first question
                        </button>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t">
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                >
                    {saving ? 'Saving...' : editingForm ? 'Save Changes' : 'Create Form'}
                </button>
                <button
                    onClick={onCancel}
                    className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
