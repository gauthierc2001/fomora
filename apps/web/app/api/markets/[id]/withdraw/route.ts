import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionFromRequest } from '@/lib/auth'
import { markets, bets, users, fomoMarkets } from '@/lib/storage'
import { prisma } from '@fomora/db'

const withdrawBetSchema = z.object({
  betId: z.string()
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== WITHDRAW BET API START ===')
    
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id: marketId } = await params
    const body = await request.json()
    const { betId } = withdrawBetSchema.parse(body)

    // Get bet
    const bet = await bets.get(betId)
    if (!bet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 })
    }

    // Verify bet belongs to user
    const user = await users.get(session.walletAddress)
    if (!user || bet.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get market from both regular and FOMO markets
    let market = await markets.get(marketId)
    if (!market) {
      const hasFomoMarket = await fomoMarkets.has(marketId)
      if (hasFomoMarket) {
        market = await fomoMarkets.get(marketId)
      }
    }
    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }

    // Check if market is still open for withdrawals (can't withdraw after market closes)
    if (market.status !== 'OPEN') {
      return NextResponse.json({ error: 'Cannot withdraw from closed market' }, { status: 400 })
    }

    // Calculate withdrawal penalty based on current implied probability
    const totalPool = market.yesPool + market.noPool
    if (totalPool === 0) {
      return NextResponse.json({ error: 'Cannot withdraw from market with no bets' }, { status: 400 })
    }
    
    // Calculate current implied probability (what the market thinks the chance is)
    const currentProbability = bet.side === 'YES' ? 
      market.noPool / totalPool : // YES probability = noPool / total (counterintuitive but correct)
      market.yesPool / totalPool  // NO probability = yesPool / total
    
    const originalProbability = 0.5 // Assume 50/50 when bet was placed
    
    let penaltyRate = 0.1 // Base 10% penalty
    
    // If user is losing (probability of their side decreased), higher penalty
    if (currentProbability < originalProbability) {
      const loss = (originalProbability - currentProbability) / originalProbability
      penaltyRate = Math.min(0.1 + loss * 0.3, 0.5) // Max 50% penalty
    }
    
    // Ensure penalty rate is reasonable
    penaltyRate = Math.max(0.05, Math.min(penaltyRate, 0.6))
    
    // Time-based penalty (closer to closing, higher penalty)
    const timeRemaining = new Date(market.closesAt).getTime() - Date.now()
    const totalDuration = new Date(market.closesAt).getTime() - new Date(market.createdAt).getTime()
    const timeProgress = 1 - (timeRemaining / totalDuration)
    
    penaltyRate += timeProgress * 0.2 // Up to 20% additional penalty based on time
    penaltyRate = Math.min(penaltyRate, 0.6) // Maximum total penalty of 60%

    const penalty = Math.floor(bet.amount * penaltyRate)
    const refundAmount = bet.amount - penalty

    console.log(`Withdrawing bet ${betId}: ${bet.amount} points, penalty: ${penalty}, refund: ${refundAmount}`)

    // Update user balance
    user.pointsBalance += refundAmount
    
    // Prevent negative stats
    user.totalBets = Math.max(0, user.totalBets - 1)
    user.totalWagered = Math.max(0, user.totalWagered - bet.amount)

    // Update market pools (ensure they never go negative)
    const netAmount = bet.amount - bet.fee // Original bet minus fee
    if (bet.side === 'YES') {
      market.yesPool = Math.max(0, market.yesPool - netAmount)
    } else {
      market.noPool = Math.max(0, market.noPool - netAmount)
    }

    // Save all changes in a transaction
    try {
      await prisma.$transaction(async (tx) => {
        // Update user
        await tx.user.update({
          where: { walletAddress: session.walletAddress },
          data: {
            pointsBalance: user.pointsBalance,
            totalBets: user.totalBets,
            totalWagered: user.totalWagered
          }
        })

        // Update market
        if (await fomoMarkets.has(market.id)) {
          await tx.fomoMarket.update({
            where: { id: market.id },
            data: {
              yesPool: market.yesPool,
              noPool: market.noPool,
              totalVolume: market.yesPool + market.noPool
            }
          })
        } else {
          await tx.market.update({
            where: { id: market.id },
            data: {
              yesPool: market.yesPool,
              noPool: market.noPool
            }
          })
        }

        // Delete bet
        await tx.bet.delete({
          where: { id: betId }
        })
      })

      // Update in-memory storage after successful transaction
      await users.set(session.walletAddress, user)
      if (await fomoMarkets.has(market.id)) {
        await fomoMarkets.set(market.id, market)
      } else {
        await markets.set(market.id, market)
      }
    } catch (error) {
      console.error('Transaction failed:', error)
      throw new Error('Failed to process withdrawal')
    }

    console.log(`✅ Bet withdrawn: ${refundAmount} points refunded (${penalty} penalty)`)
    console.log('=== WITHDRAW BET API END ===')

    return NextResponse.json({
      success: true,
      refundAmount,
      penalty,
      penaltyRate: Math.round(penaltyRate * 100),
      newBalance: user.pointsBalance,
      marketPools: {
        yesPool: market.yesPool,
        noPool: market.noPool
      }
    })
  } catch (error) {
    console.error('Withdraw bet error:', error)
    return NextResponse.json(
      { error: 'Failed to withdraw bet' },
      { status: 500 }
    )
  }
}
