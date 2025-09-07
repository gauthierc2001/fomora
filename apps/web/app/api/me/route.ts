import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

// Import shared users storage
import { users } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/me - checking session...')
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Request URL:', request.url)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    const sessionCookie = request.cookies.get('session')
    console.log('Session cookie exists:', !!sessionCookie?.value)
    console.log('Session cookie value (first 20 chars):', sessionCookie?.value?.slice(0, 20) + '...')
    
    const session = await getSessionFromRequest(request)
    console.log('Session data:', session ? 'found' : 'not found')
    if (session) {
      console.log('Session wallet:', session.walletAddress.slice(0, 8) + '...')
    }
    
    if (!session) {
      console.log('No session found, returning 401')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Find user by wallet address in database
    const user = await users.get(session.walletAddress)
    
    if (!user) {
      console.log('User not found in database')
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