import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { users } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await users.get(session.walletAddress)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        walletAddress: user.walletAddress,
        pointsBalance: user.pointsBalance,
        totalBets: user.totalBets,
        totalWagered: user.totalWagered
      }
    })
  } catch (error) {
    console.error('Debug user state error:', error)
    return NextResponse.json({ error: 'Failed to get user state' }, { status: 500 })
  }
}
