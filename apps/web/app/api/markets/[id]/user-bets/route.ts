import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { markets, bets, fomoMarkets } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id: marketId } = await params
    
    // Get market
    const market = markets.get(marketId) || fomoMarkets.get(marketId)
    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }

    // Get user bets for this market
    const userBets = Array.from(bets.values())
      .filter(bet => bet.marketId === marketId && bet.userId === session.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      bets: userBets,
      market: {
        id: market.id,
        question: market.question,
        status: market.status,
        yesPool: market.yesPool,
        noPool: market.noPool
      }
    })
  } catch (error) {
    console.error('Get user bets error:', error)
    return NextResponse.json(
      { error: 'Failed to get user bets' },
      { status: 500 }
    )
  }
}