import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { markets, bets, fomoMarkets } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get all user bets
    const userBets = Array.from(bets.values())
      .filter(bet => bet.userId === session.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Enrich bets with market information
    const enrichedBets = userBets.map(bet => {
      const market = markets.get(bet.marketId) || fomoMarkets.get(bet.marketId)
      return {
        ...bet,
        marketQuestion: market?.question || 'Market not found',
        marketStatus: market?.status || 'UNKNOWN',
        marketCategory: market?.category,
        currentPools: market ? {
          yesPool: market.yesPool,
          noPool: market.noPool
        } : null
      }
    })

    return NextResponse.json({
      bets: enrichedBets,
      totalBets: enrichedBets.length,
      totalWagered: enrichedBets.reduce((sum, bet) => sum + bet.amount, 0)
    })
  } catch (error) {
    console.error('Get user bets error:', error)
    return NextResponse.json(
      { error: 'Failed to get user bets' },
      { status: 500 }
    )
  }
}
