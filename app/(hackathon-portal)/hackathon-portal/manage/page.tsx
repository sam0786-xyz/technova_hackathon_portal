import { checkHackathonRole } from "@/lib/actions/hackathon"
import { redirect } from "next/navigation"
import HackathonManageClient from "./client"

export default async function HackathonManagePage() {
    const { role } = await checkHackathonRole()
    if (role !== 'organizer') redirect("/hackathon-portal")

    return <HackathonManageClient />
}
