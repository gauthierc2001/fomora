import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, createSession } from '@/lib/auth'
import { users } from '@/lib/storage'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress } = body

    console.log('🔐 Auth verify for wallet:', walletAddress?.slice(0, 8) + '...')

    // Check if there's already an existing session
    const existingSession = await getSessionFromRequest(request)
    if (existingSession && existingSession.walletAddress === walletAddress) {
      console.log('✅ Existing session found for wallet')
      
      // Get fresh user data
      const user = await users.get(existingSession.walletAddress)
      if (user) {
        return NextResponse.json({
          id: user.id,
          walletAddress: user.walletAddress,
          role: user.role,
          pointsBalance: user.pointsBalance,
          displayName: user.displayName,
          profilePicture: user.profilePicture
        })
      }
    }

    // No existing session or user not found - create new user and session
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    // Find or create user
    let user = await users.get(walletAddress)
    
    if (!user) {
      console.log('🆕 Creating new user for wallet:', walletAddress.slice(0, 8) + '...')
      
      const userId = randomUUID()
      const newUser = {
        id: userId,
        walletAddress: walletAddress,
        role: 'USER' as const,
        pointsBalance: 10000, // Launch points
        creditedInitial: true,
        ipHash: 'wallet-auth',
        displayName: `User ${walletAddress.slice(0, 6)}`,
        profilePicture: undefined,
        createdAt: new Date(),
        totalBets: 0,
        totalWagered: 0,
        marketsCreated: 0
      }
      
      await users.set(walletAddress, newUser)
      user = newUser
      console.log('✅ Created new user with', newUser.pointsBalance, 'points')
    }

    // Create session
    const sessionUser = {
      id: user.id,
      walletAddress: user.walletAddress,
      role: user.role as 'USER' | 'ADMIN',
      pointsBalance: user.pointsBalance
    }

    await createSession(sessionUser)
    console.log('✅ Session created for wallet:', walletAddress.slice(0, 8) + '...')

    // Return user data
    return NextResponse.json({
      id: user.id,
      walletAddress: user.walletAddress,
      role: user.role,
      pointsBalance: user.pointsBalance,
      displayName: user.displayName,
      profilePicture: user.profilePicture
    })
    
  } catch (error) {
    console.error('❌ Auth verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify authentication' },
      { status: 500 }
    )
  }
}