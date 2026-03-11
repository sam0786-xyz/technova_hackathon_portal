'use client'

import { X, Star, MessageSquare } from 'lucide-react'
import type { FeedbackQuestion, FeedbackFormWithMeta } from '@/lib/actions/feedback'

interface Props {
    form: FeedbackFormWithMeta
    onClose: () => void
}

export function FeedbackFormPreview({ form, onClose }: Props) {
    const questions = form.questions || []

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8">
            <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-bold">Preview: {form.title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Preview */}
                <div className="p-6 space-y-6">
                    {form.day_number && (
                        <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                            Day {form.day_number} Feedback
                        </div>
                    )}

                    {questions.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No questions added yet</p>
                    ) : (
                        questions.map((question, index) => (
                            <div key={question.id || index} className="space-y-2">
                                <label className="block font-medium text-gray-900">
                                    {index + 1}. {question.label}
                                    {question.is_required && <span className="text-red-500 ml-1">*</span>}
                                </label>

                                {/* Text input preview */}
                                {question.question_type === 'text' && (
                                    <input
                                        type="text"
                                        disabled
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-400"
                                        placeholder={question.placeholder || 'Text answer...'}
                                    />
                                )}

                                {/* Textarea preview */}
                                {question.question_type === 'textarea' && (
                                    <textarea
                                        disabled
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-400 min-h-[100px]"
                                        placeholder={question.placeholder || 'Long text answer...'}
                                    />
                                )}

                                {/* Rating preview */}
                                {question.question_type === 'rating' && (
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <Star
                                                key={value}
                                                className="w-8 h-8 text-gray-300"
                                            />
                                        ))}
                                        <span className="text-sm text-gray-400 ml-2">1-5 star rating</span>
                                    </div>
                                )}

                                {/* Select preview */}
                                {question.question_type === 'select' && (
                                    <select
                                        disabled
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-400"
                                    >
                                        <option>Select an option...</option>
                                        {question.options?.map((opt) => (
                                            <option key={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                )}

                                {/* Radio preview */}
                                {question.question_type === 'radio' && (
                                    <div className="space-y-2">
                                        {question.options?.map((opt) => (
                                            <label key={opt.value} className="flex items-center gap-3 text-gray-500">
                                                <input type="radio" disabled className="w-4 h-4" />
                                                <span>{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {/* Checkbox preview */}
                                {question.question_type === 'checkbox' && (
                                    <div className="space-y-2">
                                        {question.options?.map((opt) => (
                                            <label key={opt.value} className="flex items-center gap-3 text-gray-500">
                                                <input type="checkbox" disabled className="w-4 h-4 rounded" />
                                                <span>{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}

                    {/* Submit button (disabled) */}
                    <button
                        disabled
                        className="w-full py-3 bg-purple-400 text-white rounded-lg font-medium opacity-50 cursor-not-allowed"
                    >
                        Submit Feedback (Preview Only)
                    </button>
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-gray-50 rounded-b-2xl">
                    <p className="text-sm text-gray-500 text-center">
                        This is how students will see the feedback form
                    </p>
                </div>
            </div>
        </div>
    )
}
