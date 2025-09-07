import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionFromRequest } from '@/lib/auth'
import { users } from '@/lib/storage'
import { prisma } from '@fomora/db'

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(30).optional(),
  profilePicture: z.string().url().optional().nullable()
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    console.log('Profile update for session:', session.id)
    
    const body = await request.json()
    const { displayName, profilePicture } = updateProfileSchema.parse(body)
    
    // First try to find user by wallet address (primary key)
    let user = await users.get(session.walletAddress)
    let userWalletAddress = session.walletAddress
    
    // If not found, search by session ID
    if (!user) {
      const allUsers = await users.entries()
      for (const [walletAddress, userData] of allUsers) {
        if (userData.id === session.id) {
          user = userData
          userWalletAddress = walletAddress
          break
        }
      }
    }
    
    // If still not found, create user (in case storage was cleared)
    if (!user) {
      console.log('User not found in storage, creating new user...')
      const newUser = {
        id: session.id,
        walletAddress: session.walletAddress,
        role: 'user',
        pointsBalance: 1000,
        creditedInitial: true,
        ipHash: 'profile-update',
        displayName: displayName || undefined,
        profilePicture: profilePicture || undefined,
        createdAt: new Date(),
        totalBets: 0,
        totalWagered: 0,
        marketsCreated: 0
      }
      await users.set(session.walletAddress, newUser)
      user = newUser
      userWalletAddress = session.walletAddress
    }
    
    console.log('Found user:', user.walletAddress.slice(0, 8) + '...')
    
    // Ensure user has all required fields (migrate old users)
    if (!user.displayName) {
      user.displayName = `User ${user.walletAddress.slice(0, 6)}`
    }
    if (user.totalBets === undefined) user.totalBets = 0
    if (user.totalWagered === undefined) user.totalWagered = 0
    if (user.marketsCreated === undefined) user.marketsCreated = 0
    if (!user.createdAt) user.createdAt = new Date()
    
    // Update user profile
    if (displayName !== undefined) {
      user.displayName = displayName
    }
    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture
    }
    
    // Update in storage using the correct wallet address
    await prisma.user.update({
      where: { walletAddress: userWalletAddress! },
      data: {
        displayName: user.displayName,
        profilePicture: user.profilePicture
      }
    })
    
    return NextResponse.json({
      id: user.id,
      walletAddress: user.walletAddress,
      displayName: user.displayName,
      profilePicture: user.profilePicture,
      pointsBalance: user.pointsBalance,
      role: user.role,
      creditedInitial: user.creditedInitial,
      totalBets: user.totalBets,
      totalWagered: user.totalWagered,
      marketsCreated: user.marketsCreated,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // First try to find user by wallet address (primary key)
    let user = await users.get(session.walletAddress)
    let userWalletAddress = session.walletAddress
    
    // If not found, search by session ID
    if (!user) {
      const allUsers = await users.entries()
      for (const [walletAddress, userData] of allUsers) {
        if (userData.id === session.id) {
          user = userData
          userWalletAddress = walletAddress
          break
        }
      }
    }
    
    // If still not found, create user (in case storage was cleared)
    if (!user) {
      console.log('User not found in GET, creating new user...')
      const newUser = {
        id: session.id,
        walletAddress: session.walletAddress,
        role: 'user',
        pointsBalance: 1000,
        creditedInitial: true,
        ipHash: 'profile-get',
        displayName: undefined,
        profilePicture: undefined,
        createdAt: new Date(),
        totalBets: 0,
        totalWagered: 0,
        marketsCreated: 0
      }
      await users.set(session.walletAddress, newUser)
      user = newUser
      userWalletAddress = session.walletAddress
    }
    
    // Ensure user has all required fields (migrate old users)
    if (!user.displayName) {
      user.displayName = `User ${user.walletAddress.slice(0, 6)}`
    }
    if (user.totalBets === undefined) user.totalBets = 0
    if (user.totalWagered === undefined) user.totalWagered = 0
    if (user.marketsCreated === undefined) user.marketsCreated = 0
    if (!user.createdAt) user.createdAt = new Date()
    
    // Update in storage to persist migration
    await users.set(userWalletAddress!, user)
    
    return NextResponse.json({
      id: user.id,
      walletAddress: user.walletAddress,
      displayName: user.displayName,
      profilePicture: user.profilePicture,
      pointsBalance: user.pointsBalance,
      totalBets: user.totalBets,
      totalWagered: user.totalWagered,
      marketsCreated: user.marketsCreated,
      role: user.role,
      creditedInitial: user.creditedInitial,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    )
  }
}
