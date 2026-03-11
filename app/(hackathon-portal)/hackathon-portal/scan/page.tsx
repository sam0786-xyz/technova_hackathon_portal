import { checkHackathonRole } from "@/lib/actions/hackathon"
import { redirect } from "next/navigation"
import HackathonScannerClient from "./client"

export default async function HackathonScanPage() {
    const { role } = await checkHackathonRole()

    // Only organizers and volunteers can scan
    if (role !== 'organizer' && role !== 'volunteer') {
        redirect("/hackathon-portal")
    }

    return <HackathonScannerClient portalMode />
}
