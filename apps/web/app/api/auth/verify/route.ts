import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSession, getClientIP, hashIP } from '@/lib/auth'

const requestSchema = z.object({
  walletAddress: z.string().min(32).max(50)
})

// Import shared users storage
import { users } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress } = requestSchema.parse(body)
    
    console.log('Simple auth for wallet:', walletAddress.slice(0, 8) + '...')
    
    // No database required - just in-memory storage for demo
    const ipHash = hashIP(getClientIP(request))
    
    let user = users.get(walletAddress)
    
    if (!user) {
      user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        walletAddress,
        role: 'USER',
        pointsBalance: 10000, // Initial points
        creditedInitial: true,
        ipHash,
        displayName: `User ${walletAddress.slice(0, 6)}`,
        profilePicture: undefined,
        createdAt: new Date(),
        totalBets: 0,
        totalWagered: 0,
        marketsCreated: 0
      }
      users.set(walletAddress, user)
      console.log('Created new user:', walletAddress.slice(0, 8) + '...')
    } else {
      console.log('Found existing user:', walletAddress.slice(0, 8) + '...')
    }
    
    // Create session
    const sessionToken = await createSession({
      id: user.id,
      walletAddress: user.walletAddress,
      role: user.role,
      pointsBalance: user.pointsBalance
    })
    
    console.log('Session created for user:', user.walletAddress.slice(0, 8) + '...')
    
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
        pointsBalance: user.pointsBalance,
        creditedInitial: user.creditedInitial
      }
    })
    
    // Set cookie manually as backup
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: false, // Allow HTTP for localhost
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('Auth verification error:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 401 }
    )
  }
}