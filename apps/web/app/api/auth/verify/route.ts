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
    console.log('POST /api/auth/verify - starting authentication...')
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    const body = await request.json()
    const { walletAddress } = requestSchema.parse(body)
    
    console.log('Simple auth for wallet:', walletAddress.slice(0, 8) + '...')
    
    // No database required - just in-memory storage for demo
    const ipHash = hashIP(getClientIP(request))
    
    let user
    try {
      user = await users.get(walletAddress)
      console.log('Database query successful for wallet:', walletAddress.slice(0, 8) + '...')
    } catch (dbError) {
      console.error('Database error when fetching user:', dbError)
      throw new Error(`Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`)
    }
    
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
      try {
        await users.set(walletAddress, user)
        console.log('Created new user:', walletAddress.slice(0, 8) + '...')
      } catch (dbError) {
        console.error('Database error when creating user:', dbError)
        throw new Error(`Failed to create user: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`)
      }
    } else {
      console.log('Found existing user:', walletAddress.slice(0, 8) + '...')
    }
    
    // Create session
    let sessionToken
    try {
      sessionToken = await createSession({
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
        pointsBalance: user.pointsBalance
      })
      console.log('Session created for user:', user.walletAddress.slice(0, 8) + '...')
    } catch (sessionError) {
      console.error('Session creation error:', sessionError)
      throw new Error(`Failed to create session: ${sessionError instanceof Error ? sessionError.message : 'Unknown session error'}`)
    }
    
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
    const isProduction = process.env.NODE_ENV === 'production'
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
      // Don't set domain in production to allow cookies to work across subdomains
      ...(isProduction ? {} : { domain: undefined })
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