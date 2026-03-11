"use client"

import { useEffect } from "react"

export function DebugClick() {
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            console.log("Global Click Detected:", e.target)
            // Visual feedback
            const div = document.createElement("div")
            div.style.position = "fixed"
            div.style.left = `${e.clientX}px`
            div.style.top = `${e.clientY}px`
            div.style.width = "10px"
            div.style.height = "10px"
            div.style.backgroundColor = "red"
            div.style.borderRadius = "50%"
            div.style.zIndex = "99999"
            div.style.pointerEvents = "none"
            document.body.appendChild(div)
            setTimeout(() => div.remove(), 1000)
        }
        window.addEventListener("click", handler)
        return () => window.removeEventListener("click", handler)
    }, [])

    return null
}
