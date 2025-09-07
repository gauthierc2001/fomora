import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { randomUUID } from 'crypto'
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
    
    // Add detailed error tracking
    let step = 'unknown'

    // Get market from database directly to ensure it exists
    step = 'getting market from database'
    let market = await prisma.market.findUnique({ where: { id: marketId } })
    let isFomoMarket = false
    
    if (!market) {
      // Try FOMO market
      const fomoMarket = await (prisma as any).fomoMarket.findUnique({ where: { id: marketId } })
      if (fomoMarket) {
        market = fomoMarket
        isFomoMarket = true
      }
    }
    
    console.log('Market found:', !!market)
    console.log('Is FOMO market:', isFomoMarket)
    console.log('Market ID from request:', marketId)
    console.log('Market ID from database:', market?.id)
    
    if (!market) {
      console.log(`Market ${marketId} not found in database`)
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }

    // For FOMO markets, we need to create a corresponding entry in the Market table for betting
    let actualMarketId = market.id
    if (isFomoMarket) {
      console.log('FOMO market detected, checking for corresponding Market entry...')
      
      // Check if a corresponding Market entry exists
      const correspondingMarket = await prisma.market.findUnique({ where: { id: marketId } })
      if (!correspondingMarket) {
        // Create a corresponding Market entry for the FOMO market
        console.log('Creating corresponding Market entry for FOMO market...')
        try {
          await prisma.market.create({
            data: {
              id: market.id,
              slug: market.slug || market.id,
              question: market.question,
              description: market.description,
              category: market.category,
              createdBy: market.createdBy || 'fomo-system',
              status: market.status,
              closesAt: market.closesAt,
              yesPool: market.yesPool,
              noPool: market.noPool,
              // image: market.image // Removed to fix schema mismatch
            }
          })
          console.log('Successfully created corresponding Market entry')
        } catch (error) {
          console.error('Failed to create corresponding Market entry:', error)
          // If it already exists, continue anyway
        }
      }
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
      // Update market status in database
      if (isFomoMarket) {
        await (prisma as any).fomoMarket.update({
          where: { id: market.id },
          data: { status: 'CLOSED' }
        })
      } else {
        await prisma.market.update({
          where: { id: market.id },
          data: { status: 'CLOSED' }
        })
      }
      return NextResponse.json({ error: 'Market has closed' }, { status: 400 })
    }

    // Get user
    step = 'getting user'
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

    // Generate a guaranteed unique bet ID using Node.js crypto UUID
    step = 'generating unique bet ID'
    let betId: string = randomUUID() // Initialize with first UUID
    let betIdConflict = true
    let attempts = 0
    const maxIdAttempts = 10

    // Ensure we have a truly unique ID by checking the database
    while (betIdConflict && attempts < maxIdAttempts) {
      console.log(`Checking bet ID uniqueness: ${betId} (attempt ${attempts + 1})`)
      
      const existingBet = await prisma.bet.findUnique({
        where: { id: betId }
      })
      
      if (!existingBet) {
        betIdConflict = false
        console.log(`✅ Unique bet ID confirmed: ${betId}`)
      } else {
        console.log(`❌ Bet ID ${betId} already exists, generating new one...`)
        attempts++
        betId = randomUUID() // Generate new UUID for next attempt
      }
    }

    if (betIdConflict) {
      throw new Error('Unable to generate unique bet ID after multiple attempts')
    }

    step = 'preparing transaction'
    console.log(`Using bet ID: ${betId}`)

    // Process bet in transaction
    step = 'starting transaction'
    try {
      const [updatedUser, updatedMarket, newBet] = await prisma.$transaction(async (tx) => {
        // Update user
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            pointsBalance: { decrement: amount }
          } as any
        })

        // Update market
        let updatedMarket
        if (isFomoMarket) {
          const updateData: any = {
            totalVolume: { increment: netAmount },
            participants: { increment: 1 }
          }
          if (side === 'YES') {
            updateData.yesPool = { increment: netAmount }
          } else {
            updateData.noPool = { increment: netAmount }
          }
          
          updatedMarket = await (tx as any).fomoMarket.update({
            where: { id: market.id },
            data: updateData
          })
        } else {
          const updateData: any = {}
          if (side === 'YES') {
            updateData.yesPool = { increment: netAmount }
          } else {
            updateData.noPool = { increment: netAmount }
          }
          
          updatedMarket = await tx.market.update({
            where: { id: market.id },
            data: updateData
          })
        }

        // Create bet with pre-verified unique ID
        console.log('Creating bet with verified unique ID:', {
          id: betId,
          userId: user.id,
          marketId: actualMarketId,
          side,
          amount,
          fee: penaltyFee
        })
        
        const newBet = await tx.bet.create({
          data: {
            id: betId,
            userId: user.id,
            marketId: actualMarketId,
            side: side,
            amount: amount,
            fee: penaltyFee,
            // marketType: isFomoMarket ? 'FOMO' : 'REGULAR', // Temporarily removed until schema is deployed
            createdAt: new Date()
          }
        })

        return [updatedUser, updatedMarket, newBet]
      })

      // Update memory state with transaction results
      const updatedUserData = {
        ...user,
        pointsBalance: updatedUser.pointsBalance
      }
      await users.set(session.walletAddress, updatedUserData)
      
      // Update market data with new pools
      const updatedMarketData = {
        ...market,
        yesPool: updatedMarket.yesPool,
        noPool: updatedMarket.noPool
      }
      
      if (isFomoMarket) {
        await fomoMarkets.set(market.id, updatedMarketData)
      } else {
        await markets.set(market.id, updatedMarketData)
      }

      // Update bet cache with proper structure
      const betData = {
        id: newBet.id,
        userId: newBet.userId,
        marketId: newBet.marketId,
        side: newBet.side,
        amount: newBet.amount,
        createdAt: newBet.createdAt
      }
      await bets.set(newBet.id, betData)

      // Log action
      await logAction('BET', {
        marketId,
        side,
        amount,
        netAmount,
        fee: penaltyFee
      }, user.id, request)

      console.log(`✅ Bet placed successfully: ${updatedUser.walletAddress.slice(0, 8)}... bet ${amount} points on ${side}`)
      console.log(`New user balance: ${updatedUser.pointsBalance}`)
      console.log(`Market pools - YES: ${updatedMarket.yesPool}, NO: ${updatedMarket.noPool}`)

      return NextResponse.json({
        success: true,
        betId: newBet.id,
        newBalance: updatedUser.pointsBalance,
        marketPools: {
          yesPool: updatedMarket.yesPool,
          noPool: updatedMarket.noPool
        },
        penaltyFee,
        netAmount
      })

    } catch (error) {
      console.error('❌ TRANSACTION FAILED:', error)
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack'
      })
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

  } catch (error) {
    console.error(`❌ Place bet error:`, error)
    
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
      { 
        error: 'Failed to place bet. Please try again.',
        debug: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : 'No stack') : undefined
        }
      },
      { status: 500 }
    )
  } finally {
    console.log('=== PLACE BET API END ===')
  }
}