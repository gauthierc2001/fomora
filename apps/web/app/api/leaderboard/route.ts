import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionFromRequest } from '@/lib/auth'
import { users } from '@/lib/storage'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('50'),
  search: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, search } = querySchema.parse(
      Object.fromEntries(searchParams)
    )
    
    const pageNum = parseInt(page)
    const limitNum = Math.min(parseInt(limit), 50) // Max 50 per page
    const skip = (pageNum - 1) * limitNum
    
    // Get session to show user rank
    const session = await getSessionFromRequest(request)
    
    console.log(`Leaderboard API: ${users.size} total users in storage`)
    
    // Convert users map to array and sort by points, then by creation date
    let allUsers = Array.from(users.values()).sort((a, b) => {
      // Primary sort: points (descending)
      if (b.pointsBalance !== a.pointsBalance) {
        return b.pointsBalance - a.pointsBalance
      }
      // Secondary sort: creation date (ascending - earlier users rank higher)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase()
      allUsers = allUsers.filter(user => 
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.walletAddress.toLowerCase().includes(searchLower)
      )
      console.log(`Filtered to ${allUsers.length} users with search: "${search}"`)
    }
    
    // Apply pagination
    const paginatedUsers = allUsers.slice(skip, skip + limitNum)
    
    // Add ranks and format
    const leaderboard = paginatedUsers.map((user, index) => ({
      id: user.id,
      walletAddress: `${user.walletAddress.slice(0, 2)}...${user.walletAddress.slice(-4)}`, // Privacy: show only 2+4 chars
      fullWalletAddress: user.walletAddress, // Keep full address for search functionality
      displayName: user.displayName || `User ${user.walletAddress.slice(0, 6)}`,
      profilePicture: user.profilePicture,
      pointsBalance: user.pointsBalance,
      totalBets: user.totalBets,
      totalWagered: user.totalWagered,
      marketsCreated: user.marketsCreated,
      createdAt: user.createdAt,
      rank: skip + index + 1
    }))
    
    console.log(`Returning ${leaderboard.length} users for leaderboard`)
    
    // Get user's rank if authenticated
    let userRank = null
    if (session) {
      const userIndex = allUsers.findIndex(u => u.id === session.id)
      if (userIndex !== -1) {
        userRank = userIndex + 1
      }
    }
    
    return NextResponse.json({
      leaderboard,
      userRank,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: allUsers.length,
        pages: Math.ceil(allUsers.length / limitNum)
      }
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Failed to get leaderboard' },
      { status: 500 }
    )
  }
}
