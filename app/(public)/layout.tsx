import { Navbar } from "@/components/layout/navbar"
import { auth } from "@/lib/auth"

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    return (
        <div className="flex flex-col min-h-screen bg-black text-white dark">
            <Navbar user={session?.user} />
            <main className="flex-1 pt-16">
                {children}
            </main>
        </div>
    )
}
