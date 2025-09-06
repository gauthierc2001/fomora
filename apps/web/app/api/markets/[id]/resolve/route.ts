import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionFromRequest } from '@/lib/auth'
import { markets, bets, users } from '@/lib/storage'

const resolveMarketSchema = z.object({
  outcome: z.enum(['YES', 'NO']),
  reason: z.string().optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== RESOLVE MARKET API START ===')
    
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Only system/admin can resolve markets for now
    // In production, you'd want proper admin checks
    
    const { id: marketId } = await params
    const body = await request.json()
    const { outcome, reason } = resolveMarketSchema.parse(body)

    // Get market
    const market = markets.get(marketId)
    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }

    if (market.status !== 'OPEN') {
      return NextResponse.json({ error: 'Market already resolved' }, { status: 400 })
    }

    console.log(`Resolving market ${marketId} with outcome: ${outcome}`)

    // Update market status
    market.status = 'RESOLVED'
    market.outcome = outcome
    market.resolvedAt = new Date()
    if (reason) market.resolutionReason = reason

    // Find all bets for this market
    const marketBets = Array.from(bets.values()).filter(bet => bet.marketId === marketId)
    let winnersCount = 0
    let losersCount = 0
    let totalPayout = 0

    console.log(`Found ${marketBets.length} bets for market ${marketId}`)

    // Calculate payouts for winning bets
    const totalPool = market.yesPool + market.noPool
    const winningPool = outcome === 'YES' ? market.yesPool : market.noPool
    const losingPool = outcome === 'YES' ? market.noPool : market.yesPool

    for (const bet of marketBets) {
      const user = Array.from(users.values()).find(u => u.id === bet.userId)
      if (!user) continue

      if (bet.side === outcome) {
        // Winner - gets back bet amount plus share of losing pool
        const winnings = bet.amount + (bet.amount / winningPool) * losingPool
        user.pointsBalance += Math.floor(winnings)
        winnersCount++
        totalPayout += Math.floor(winnings)
        console.log(`Winner: ${user.walletAddress.slice(0, 8)}... won ${Math.floor(winnings)} points`)
      } else {
        // Loser - loses their bet (already deducted when bet was placed)
        losersCount++
        console.log(`Loser: ${user.walletAddress.slice(0, 8)}... lost ${bet.amount} points`)
      }

      // Update user in storage
      for (const [walletAddress, userData] of users) {
        if (userData.id === user.id) {
          users.set(walletAddress, user)
          break
        }
      }
    }

    // Save market changes
    markets.set(market.id, market)

    console.log(`✅ Market resolved: ${winnersCount} winners, ${losersCount} losers, ${totalPayout} total payout`)
    console.log('=== RESOLVE MARKET API END ===')

    return NextResponse.json({
      success: true,
      outcome,
      winnersCount,
      losersCount,
      totalPayout,
      message: `Market resolved: ${outcome} won. ${winnersCount} winners received ${totalPayout} total points.`
    })
  } catch (error) {
    console.error('Resolve market error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve market' },
      { status: 500 }
    )
  }
}
