import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionFromRequest, logAction } from '@/lib/auth'
import { prisma } from '@fomora/db'

const placeBetSchema = z.object({
  side: z.enum(['YES', 'NO']),
  amount: z.number().min(1)
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== PLACE BET API START ===')
  
  try {
    // Get and validate session
    const session = await getSessionFromRequest(request)
    console.log('Session:', session ? `${session.walletAddress.slice(0, 8)}...` : 'not found')
    
    if (!session) {
      console.log('No session - returning 401')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Parse request
    const { id: marketId } = params
    const body = await request.json()
    console.log('Request body:', body)
    
    const { side, amount } = placeBetSchema.parse(body)
    console.log(`Parsed bet: ${amount} points on ${side} for market ${marketId}`)

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { walletAddress: session.walletAddress }
    })
    
    if (!user) {
      console.log(`User ${session.walletAddress} not found in database`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    console.log(`User found: ${user.walletAddress.slice(0, 8)}... Balance: ${user.pointsBalance}`)

    // Check user balance
    if (user.pointsBalance < amount) {
      console.log(`Insufficient balance: ${user.pointsBalance} < ${amount}`)
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
    }

    // Get market (try both regular and FOMO markets)
    let market = await prisma.market.findUnique({ where: { id: marketId } })
    let isFomoMarket = false
    
    if (!market) {
      market = await prisma.fomoMarket.findUnique({ where: { id: marketId } })
      isFomoMarket = true
    }
    
    if (!market) {
      console.log(`Market ${marketId} not found`)
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }
    
    console.log(`Market found: ${market.question} (${isFomoMarket ? 'FOMO' : 'Regular'})`)
    console.log(`Market status: ${market.status}, YES: ${market.yesPool}, NO: ${market.noPool}`)

    // Validate market status
    if (market.status !== 'OPEN') {
      console.log('Market not open for betting')
      return NextResponse.json({ error: 'Market is not open for betting' }, { status: 400 })
    }

    // Check if market has expired
    const now = new Date()
    const closingTime = new Date(market.closesAt)
    if (now >= closingTime) {
      console.log(`Market has closed at ${closingTime}, current time: ${now}`)
      return NextResponse.json({ error: 'Market has closed' }, { status: 400 })
    }

    // Calculate fees
    const penaltyFee = Math.floor(amount * 0.01)
    const netAmount = amount - penaltyFee
    console.log(`Fee calculation: amount=${amount}, fee=${penaltyFee}, net=${netAmount}`)

    // Create bet ID
    const betId = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log(`Generated bet ID: ${betId}`)

    // Process bet in transaction
    try {
      const result = await prisma.$transaction(async (tx) => {
        console.log('Starting transaction...')
        
        // Update user
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            pointsBalance: user.pointsBalance - amount,
            totalBets: user.totalBets + 1,
            totalWagered: user.totalWagered + amount
          }
        })
        console.log(`User updated: new balance ${updatedUser.pointsBalance}`)

        // Update market
        let updatedMarket
        if (isFomoMarket) {
          updatedMarket = await tx.fomoMarket.update({
            where: { id: marketId },
            data: {
              yesPool: side === 'YES' ? market.yesPool + netAmount : market.yesPool,
              noPool: side === 'NO' ? market.noPool + netAmount : market.noPool,
              totalVolume: (market.totalVolume || 0) + netAmount,
              participants: (market.participants || 0) + 1
            }
          })
        } else {
          updatedMarket = await tx.market.update({
            where: { id: marketId },
            data: {
              yesPool: side === 'YES' ? market.yesPool + netAmount : market.yesPool,
              noPool: side === 'NO' ? market.noPool + netAmount : market.noPool,
              totalVolume: (market.totalVolume || 0) + netAmount
            }
          })
        }
        console.log(`Market updated: YES=${updatedMarket.yesPool}, NO=${updatedMarket.noPool}`)

        // Create bet
        const newBet = await tx.bet.create({
          data: {
            id: betId,
            userId: user.id,
            marketId: marketId,
            side: side,
            amount: amount,
            fee: penaltyFee,
            createdAt: now
          }
        })
        console.log(`Bet created: ${newBet.id}`)

        return { updatedUser, updatedMarket, newBet }
      })

      // Log action
      await logAction('BET', {
        marketId,
        side,
        amount,
        netAmount,
        fee: penaltyFee
      }, user.id, request)

      console.log(`✅ Bet placed successfully!`)
      console.log(`Final state - User balance: ${result.updatedUser.pointsBalance}`)
      console.log(`Final state - Market pools: YES=${result.updatedMarket.yesPool}, NO=${result.updatedMarket.noPool}`)

      return NextResponse.json({
        success: true,
        betId,
        newBalance: result.updatedUser.pointsBalance,
        marketPools: {
          yesPool: result.updatedMarket.yesPool,
          noPool: result.updatedMarket.noPool
        },
        penaltyFee,
        netAmount
      })

    } catch (transactionError) {
      console.error('❌ Transaction failed:', transactionError)
      throw new Error(`Transaction failed: ${transactionError.message}`)
    }

  } catch (error) {
    console.error('❌ Place bet error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid bet parameters', details: error.errors },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack
      })
      
      return NextResponse.json(
        { error: error.message || 'Failed to place bet' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to place bet. Please try again.' },
      { status: 500 }
    )
  } finally {
    console.log('=== PLACE BET API END ===')
  }
}