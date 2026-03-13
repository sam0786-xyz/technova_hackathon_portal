"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams?.get("error")

    let errorMessage = "An unknown authentication error occurred."

    if (error === "AccessDenied") {
        errorMessage = "Your email is not allowed. Please use a valid @ug.sharda.ac.in, @pg.sharda.ac.in, or authorized club email."
    } else if (error === "Configuration") {
        errorMessage = "There is a problem with the server configuration. Please check the logs."
    } else if (error) {
        errorMessage = `Authentication error: ${error}`
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center space-y-6 border border-white/20">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white text-red-500">Login Failed</h1>
                    <p className="text-gray-300">{errorMessage}</p>
                </div>

                <div className="pt-4">
                    <Link
                        href="/login"
                        className="inline-block bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        Try Again
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function ErrorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ErrorContent />
        </Suspense>
    )
}
