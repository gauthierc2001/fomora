import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionFromRequest, logAction } from '@/lib/auth'
import { markets, bets, users, fomoMarkets } from '@/lib/storage'
import { prisma } from '@fomora/db'

const placeBetSchema = z.object({
  side: z.enum(['YES', 'NO']),
  amount: z.number().min(1)
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== PLACE BET API START ===')
    
    // Get and validate session
    const session = await getSessionFromRequest(request)
    console.log('Session:', session ? 'found' : 'not found')
    if (!session) {
      console.log('No session - returning 401')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Parse request
    const { id: marketId } = params
    const body = await request.json()
    console.log('Request body:', body)
    
    try {
      const { side, amount } = placeBetSchema.parse(body)
      console.log(`Parsed bet: ${amount} points on ${side} for market ${marketId}`)
    } catch (error) {
      console.error('Invalid request body:', error)
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { side, amount } = placeBetSchema.parse(body)

    // Get market
    let market = await markets.get(marketId) || await fomoMarkets.get(marketId)
    console.log('Market found:', !!market)
    
    if (!market) {
      console.log(`Market ${marketId} not found`)
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }

    // Validate market status
    console.log(`Market status: ${market.status}, closes at: ${market.closesAt}`)
    if (market.status !== 'OPEN') {
      console.log('Market not open for betting')
      return NextResponse.json({ error: 'Market is not open for betting' }, { status: 400 })
    }

    // Check if market has expired
    const now = new Date()
    const closingTime = new Date(market.closesAt)
    if (now >= closingTime) {
      console.log(`Market has closed at ${closingTime}, current time: ${now}`)
      market.status = 'CLOSED'
      if (await fomoMarkets.has(market.id)) {
        await fomoMarkets.set(market.id, market)
      } else {
        await markets.set(market.id, market)
      }
      return NextResponse.json({ error: 'Market has closed' }, { status: 400 })
    }

    // Get user
    const user = await users.get(session.walletAddress)
    console.log('User found:', !!user)
    console.log('User balance:', user?.pointsBalance)
    if (!user) {
      console.log(`User ${session.walletAddress} not found`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate balance
    if (user.pointsBalance < amount) {
      console.log(`Insufficient balance: ${user.pointsBalance} < ${amount}`)
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
    }

    // Calculate fees
    const penaltyFee = Math.floor(amount * 0.01)
    const netAmount = amount - penaltyFee

    // Create bet ID
    const betId = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Process bet in transaction
    try {
      const [updatedUser, updatedMarket, newBet] = await prisma.$transaction(async (tx) => {
        // Update user
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            pointsBalance: { decrement: amount },
            totalBets: { increment: 1 },
            totalWagered: { increment: amount }
          }
        })

        // Update market
        let updatedMarket
        if (await fomoMarkets.has(market.id)) {
          updatedMarket = await tx.fomoMarket.update({
            where: { id: market.id },
            data: {
              yesPool: side === 'YES' ? { increment: netAmount } : undefined,
              noPool: side === 'NO' ? { increment: netAmount } : undefined,
              totalVolume: { increment: netAmount },
              participants: { increment: 1 }
            }
          })
        } else {
          updatedMarket = await tx.market.update({
            where: { id: market.id },
            data: {
              yesPool: side === 'YES' ? { increment: netAmount } : undefined,
              noPool: side === 'NO' ? { increment: netAmount } : undefined,
              totalVolume: { increment: netAmount }
            }
          })
        }

        // Create bet
        const newBet = await tx.bet.create({
          data: {
            id: betId,
            userId: user.id,
            marketId: market.id,
            side: side,
            amount: amount,
            fee: penaltyFee,
            createdAt: new Date()
          }
        })

        return [updatedUser, updatedMarket, newBet]
      })

      // Update memory state with transaction results
      await users.set(session.walletAddress, updatedUser)
      
      if (await fomoMarkets.has(market.id)) {
        await fomoMarkets.set(market.id, updatedMarket)
      } else {
        await markets.set(market.id, updatedMarket)
      }

      // Update bet cache
      await bets.set(betId, newBet)

      // Log action
      await logAction('BET', {
        marketId,
        side,
        amount,
        netAmount,
        fee: penaltyFee
      }, user.id, request)

      console.log(`✅ Bet placed successfully: ${user.walletAddress.slice(0, 8)}... bet ${amount} points on ${side}`)
      console.log(`New user balance: ${user.pointsBalance}`)
      console.log(`Market pools - YES: ${market.yesPool}, NO: ${market.noPool}`)

      return NextResponse.json({
        success: true,
        betId,
        newBalance: user.pointsBalance,
        marketPools: {
          yesPool: market.yesPool,
          noPool: market.noPool
        },
        penaltyFee,
        netAmount
      })

    } catch (error) {
      console.error('Transaction failed:', error)
      throw new Error('Failed to process bet')
    }

  } catch (error) {
    console.error('Place bet error:', error)
    
    // Determine error type and return appropriate response
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid bet parameters', details: error.errors },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      // Check for specific error messages
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
      if (error.message.includes('insufficient') || error.message.includes('closed')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      // Log detailed error info
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to place bet. Please try again.' },
      { status: 500 }
    )
  } finally {
    console.log('=== PLACE BET API END ===')
  }
}