import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

// Import shared users storage
import { users } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/me - checking session...')
    const sessionCookie = request.cookies.get('session')
    console.log('Session cookie exists:', !!sessionCookie?.value)
    
    const session = await getSessionFromRequest(request)
    console.log('Session data:', session ? 'found' : 'not found')
    
    if (!session) {
      console.log('No session found, returning 401')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Find user by wallet address in memory
    let user = null
    for (const [walletAddress, userData] of users.entries()) {
      if (userData.id === session.id) {
        user = userData
        break
      }
    }
    
    if (!user) {
      console.log('User not found in memory storage')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    console.log('Found user:', user.walletAddress.slice(0, 8) + '...')
    
    return NextResponse.json({
      id: user.id,
      walletAddress: user.walletAddress,
      role: user.role,
      pointsBalance: user.pointsBalance,
      creditedInitial: user.creditedInitial
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    )
  }
}

// Users storage is now shared via @/lib/storage