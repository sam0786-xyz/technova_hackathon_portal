import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { processMissedReferrals } from '@/lib/actions/fix-referrals'

export async function POST() {
    const session = await auth()

    // Only super_admin can run this
    if (!session?.user || session.user.role !== 'super_admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const result = await processMissedReferrals()
        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Error processing missed referrals:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
