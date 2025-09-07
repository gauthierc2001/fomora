import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, logAction } from '@/lib/auth'
import { prisma } from '@fomora/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    // Get all users with their stats
    const users = await prisma.user.findMany({
      where: {
        creditedInitial: true, // Only users who participated
        pointsBalance: { gt: 0 } // Only users with remaining points
      },
      include: {
        bets: {
          select: {
            amount: true,
            marketId: true
          }
        },
        markets: true
      },
      orderBy: {
        pointsBalance: 'desc'
      }
    })
    
    // Calculate additional stats
    const eligibilityData = users.map((user, index) => {
      const totalWagered = user.bets.reduce((sum, bet) => sum + bet.amount, 0)
      const uniqueMarkets = new Set(user.bets.map(bet => bet.marketId)).size
      
      return {
        rank: index + 1,
        walletAddress: user.walletAddress,
        finalBalance: user.pointsBalance,
        totalBets: user.totalBets,
        totalWagered,
        marketsCreated: user.marketsCreated,
        marketsParticipated: uniqueMarkets,
        joinedAt: user.createdAt.toISOString(),
        lastActive: user.lastSeenAt.toISOString()
      }
    })
    
    // Generate CSV content
    const headers = [
      'rank',
      'walletAddress', 
      'finalBalance',
      'totalBets',
      'totalWagered',
      'marketsCreated',
      'marketsParticipated',
      'joinedAt',
      'lastActive'
    ]
    
    const csvContent = [
      headers.join(','),
      ...eligibilityData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row]
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        }).join(',')
      )
    ].join('\n')
    
    await logAction('ADMIN_ACTION', {
      action: 'airdrop_export',
      eligibleUsers: eligibilityData.length,
      totalPoints: eligibilityData.reduce((sum, user) => sum + user.finalBalance, 0)
    }, session.walletAddress, request)
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="fomora-airdrop-eligibility-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Export airdrop error:', error)
    return NextResponse.json(
      { error: 'Failed to export airdrop data' },
      { status: 500 }
    )
  }
}
