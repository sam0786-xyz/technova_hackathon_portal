import { NextResponse } from "next/server"
import * as xlsx from 'xlsx'
import { auth } from "@/lib/auth"

export async function GET() {
    const session = await auth()
    if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Define the exact headers expected by the import function
    const templateData = [
        {
            "Team Name": "Example Team",
            "Idea/Project Title": "An amazing AI project",
            "Team ID (Optional)": "TEAM01",
            "Project Description": "Solving world problems with AI",
            "Leader Name": "John Doe",
            "Leader Email": "john@example.com",
            "Leader Phone": "9876543210",
            "Member 1 Name": "Jane Smith",
            "Member 1 Email": "jane@example.com",
            "Member 1 Phone": "1234567890",
            "Member 2 Name": "Alice Johnson",
            "Member 2 Email": "",
            "Member 2 Phone": "",
            "Member 3 Name": "",
            "Member 3 Email": "",
            "Member 3 Phone": "",
            "Member 4 Name": "",
            "Member 4 Email": "",
            "Member 4 Phone": "",
        }
    ]

    const worksheet = xlsx.utils.json_to_sheet(templateData)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, "Teams")

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="technova_hackathon_template.xlsx"'
        }
    })
}
