import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionFromRequest } from '@/lib/auth'
import { markets, bets, users, fomoMarkets } from '@/lib/storage'

const placeBetSchema = z.object({
  side: z.enum(['YES', 'NO']),
  amount: z.number().min(1)
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== PLACE BET API START ===')
    
    const session = await getSessionFromRequest(request)
    console.log('Session:', session ? 'found' : 'not found')
    if (!session) {
      console.log('No session - returning 401')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id: marketId } = await params
    const body = await request.json()
    console.log('Request body:', body)
    
    const { side, amount } = placeBetSchema.parse(body)
    console.log(`Parsed bet: ${amount} points on ${side} for market ${marketId}`)

    // Get market from both regular and FOMO markets
    let market = await markets.get(marketId) || await fomoMarkets.get(marketId)
    console.log('Market found:', !!market)
    
    // If market not found, try fallback for old IDs
    if (!market && marketId.includes('_')) {
      console.log(`Market ${marketId} not found, searching for similar markets...`)
      
      // Search in both regular markets and FOMO markets
      const allMarkets = [...markets.entries(), ...fomoMarkets.entries()]
      
      if (marketId.includes('meme') || marketId.includes('doge')) {
        for (const [id, marketData] of allMarkets) {
          if (id.includes('doge') && marketData.question.toLowerCase().includes('dogecoin')) {
            console.log(`Found Dogecoin market: ${id}`)
            market = marketData
            break
          }
        }
      } else if (marketId.includes('pepe')) {
        for (const [id, marketData] of allMarkets) {
          if (id.includes('pepe') && marketData.question.toLowerCase().includes('pepe')) {
            console.log(`Found Pepe market: ${id}`)
            market = marketData
            break
          }
        }
      } else if (marketId.includes('shib')) {
        for (const [id, marketData] of allMarkets) {
          if (id.includes('shib') && marketData.question.toLowerCase().includes('shiba')) {
            console.log(`Found Shiba market: ${id}`)
            market = marketData
            break
          }
        }
      }
    }
    
    if (!market) {
      console.log(`Market ${marketId} not found`)
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }
    console.log(`Market status: ${market.status}, closes at: ${market.closesAt}`)

    if (market.status !== 'OPEN') {
      console.log('Market not open for betting')
      return NextResponse.json({ error: 'Market is not open for betting' }, { status: 400 })
    }

    // Check if market has expired (with a small buffer for FOMO markets)
    const now = new Date()
    const closingTime = new Date(market.closesAt)
    if (now >= closingTime) {
      console.log(`Market has closed at ${closingTime}, current time: ${now}`)
      // Auto-close expired markets
      market.status = 'CLOSED'
      if (fomoMarkets.has(market.id)) {
        fomoMarkets.set(market.id, market)
      } else {
        markets.set(market.id, market)
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

    // Re-check user balance just before deduction (prevent race conditions)
    const currentUser = await users.get(session.walletAddress)
    if (!currentUser || currentUser.pointsBalance < amount) {
      console.log(`Insufficient balance at execution: ${currentUser?.pointsBalance || 0} < ${amount}`)
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
    }

    // Calculate penalty fee (1% of bet amount)
    const penaltyFee = Math.floor(amount * 0.01)
    const netAmount = amount - penaltyFee

    // Calculate potential gain/loss based on pool sizes
    const totalPool = market.yesPool + market.noPool + netAmount
    let potentialGain = 0
    
    if (side === 'YES') {
      potentialGain = Math.floor((netAmount / (market.yesPool + netAmount)) * market.noPool)
    } else {
      potentialGain = Math.floor((netAmount / (market.noPool + netAmount)) * market.yesPool)
    }

    // Create bet with timestamp to ensure uniqueness
    const betId = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const bet = {
      id: betId,
      userId: currentUser.id,
      marketId,
      side,
      amount,
      netAmount,
      penaltyFee,
      potentialGain,
      createdAt: new Date()
    }

    // Atomic-like operations: Update user balance and stats
    currentUser.pointsBalance -= amount
    currentUser.totalBets = Math.max(0, currentUser.totalBets + 1)
    currentUser.totalWagered = Math.max(0, currentUser.totalWagered + amount)

    // Validate balance didn't go negative due to concurrent operations
    if (currentUser.pointsBalance < 0) {
      console.log(`Balance went negative, rolling back: ${currentUser.pointsBalance}`)
      currentUser.pointsBalance += amount
      currentUser.totalBets = Math.max(0, currentUser.totalBets - 1)
      currentUser.totalWagered = Math.max(0, currentUser.totalWagered - amount)
      return NextResponse.json({ error: 'Insufficient points (race condition detected)' }, { status: 400 })
    }

    // Update market pools with net amount after penalty (ensure they never go negative)
    if (side === 'YES') {
      market.yesPool = Math.max(0, market.yesPool + netAmount)
    } else {
      market.noPool = Math.max(0, market.noPool + netAmount)
    }

    // Save all changes atomically
    try {
      users.set(session.walletAddress, currentUser)
      
      // Check if it's a FOMO market or regular market and save to correct storage
      if (fomoMarkets.has(market.id)) {
        fomoMarkets.set(market.id, market)
      } else {
        markets.set(market.id, market)
      }
      
      bets.set(betId, bet)
    } catch (error) {
      // Rollback on any save error
      console.error('Save error, rolling back:', error)
      currentUser.pointsBalance += amount
      currentUser.totalBets = Math.max(0, currentUser.totalBets - 1)
      currentUser.totalWagered = Math.max(0, currentUser.totalWagered - amount)
      if (side === 'YES') {
        market.yesPool = Math.max(0, market.yesPool - amount)
      } else {
        market.noPool = Math.max(0, market.noPool - amount)
      }
      throw error
    }
    console.log(`Bet stored with ID: ${betId}`)
    console.log(`Total bets in storage: ${bets.size}`)

    console.log(`✅ Bet placed successfully: ${currentUser.walletAddress.slice(0, 8)}... bet ${amount} points on ${side} for market ${marketId}`)
    console.log(`New user balance: ${currentUser.pointsBalance}`)
    console.log(`Market pools - YES: ${market.yesPool}, NO: ${market.noPool}`)
    console.log('=== PLACE BET API END ===')

    return NextResponse.json({
      success: true,
      bet,
      newBalance: currentUser.pointsBalance,
      marketPools: {
        yesPool: market.yesPool,
        noPool: market.noPool
      },
      penaltyFee,
      netAmount,
      potentialGain
    })
  } catch (error) {
    console.error('Place bet error:', error)
    return NextResponse.json(
      { error: 'Failed to place bet' },
      { status: 500 }
    )
  }
}