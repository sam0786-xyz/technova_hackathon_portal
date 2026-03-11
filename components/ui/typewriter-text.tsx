'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TypewriterTextProps {
    words: string[]
    className?: string
    typingSpeed?: number
    deletingSpeed?: number
    pauseDuration?: number
    cursorClassName?: string
}

export function TypewriterText({
    words,
    className,
    typingSpeed = 100,
    deletingSpeed = 50,
    pauseDuration = 2000,
    cursorClassName
}: TypewriterTextProps) {
    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [currentText, setCurrentText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const word = words[currentWordIndex]

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                if (currentText.length < word.length) {
                    setCurrentText(word.slice(0, currentText.length + 1))
                } else {
                    // Word complete, pause then start deleting
                    setTimeout(() => setIsDeleting(true), pauseDuration)
                }
            } else {
                // Deleting
                if (currentText.length > 0) {
                    setCurrentText(currentText.slice(0, -1))
                } else {
                    // Move to next word
                    setIsDeleting(false)
                    setCurrentWordIndex((prev) => (prev + 1) % words.length)
                }
            }
        }, isDeleting ? deletingSpeed : typingSpeed)

        return () => clearTimeout(timeout)
    }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, pauseDuration])

    return (
        <span className={cn('inline-flex items-center', className)}>
            <span>{currentText}</span>
            <motion.span
                className={cn('inline-block w-[3px] h-[1em] bg-current ml-1', cursorClassName)}
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            />
        </span>
    )
}

interface TextRotateProps {
    words: string[]
    className?: string
    duration?: number
}

export function TextRotate({
    words,
    className,
    duration = 3
}: TextRotateProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % words.length)
        }, duration * 1000)

        return () => clearInterval(interval)
    }, [words.length, duration])

    return (
        <span className={cn('inline-block relative align-baseline', className)} style={{ minWidth: '160px' }}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 0.3,
                        ease: 'easeInOut'
                    }}
                    className="inline-block"
                >
                    {words[currentIndex]}
                </motion.span>
            </AnimatePresence>
        </span>
    )
}
