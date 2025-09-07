import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@fomora/db'

export async function GET(request: NextRequest) {
  try {
    // Get sample of existing bet IDs to check for patterns
    const existingBets = await prisma.bet.findMany({
      select: {
        id: true,
        createdAt: true,
        userId: true,
        marketId: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    // Count total bets
    const totalBets = await prisma.bet.count()

    // Check for any duplicate IDs (shouldn't exist but let's verify)
    const allBetIds = await prisma.bet.findMany({
      select: { id: true }
    })
    
    const idCounts = allBetIds.reduce((acc, bet) => {
      acc[bet.id] = (acc[bet.id] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const duplicateIds = Object.entries(idCounts)
      .filter(([_, count]) => count > 1)
      .map(([id, count]) => ({ id, count }))

    return NextResponse.json({
      totalBets,
      recentBets: existingBets,
      duplicateIds,
      summary: {
        hasDuplicates: duplicateIds.length > 0,
        totalCount: totalBets,
        recentCount: existingBets.length
      }
    })
  } catch (error) {
    console.error('Debug bet IDs error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch bet debug info',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
