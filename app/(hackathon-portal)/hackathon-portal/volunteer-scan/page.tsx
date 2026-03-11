import { checkHackathonRole } from "@/lib/actions/hackathon"
import { redirect } from "next/navigation"
import VolunteerScannerClient from "./client"

export default async function VolunteerScanPage() {
    const { role } = await checkHackathonRole()

    // Only organizers (admin, super_admin, student_lead) can scan volunteers
    if (role !== 'organizer') {
        redirect("/hackathon-portal")
    }

    return <VolunteerScannerClient />
}
