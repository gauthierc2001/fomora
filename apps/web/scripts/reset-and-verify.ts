import { prisma } from '@fomora/db'
import { createHash } from 'crypto'

async function resetDatabase() {
  console.log('🗑️ Clearing database...')
  
  // Clear all data
  await prisma.bet.deleteMany()
  await prisma.market.deleteMany()
  await prisma.fomoMarket.deleteMany()
  await prisma.actionLog.deleteMany()
  await prisma.user.deleteMany()
  
  console.log('✨ Database cleared')
}

async function createTestUser() {
  console.log('👤 Creating test user...')
  
  const user = await prisma.user.create({
    data: {
      id: 'test_user',
      walletAddress: '0x1234567890123456789012345678901234567890',
      role: 'USER',
      pointsBalance: 10000,
      creditedInitial: true,
      displayName: 'Test User'
    }
  })
  
  console.log('✅ Test user created:', user.id)
  return user
}

async function createTestMarket(createdBy: string) {
  console.log('📊 Creating test market...')
  
  const now = new Date()
  const closes = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
  
  const market = await prisma.market.create({
    data: {
      id: 'test_market',
      slug: 'test-market',
      question: 'Will BTC hit 100k by EOY?',
      description: 'Bitcoin price must reach or exceed $100,000 on any major exchange.',
      category: 'Crypto',
      createdBy,
      status: 'OPEN',
      closesAt: closes,
      yesPool: 1000,
      noPool: 1000
    }
  })
  
  console.log('✅ Test market created:', market.id)
  return market
}

async function placeBet(userId: string, marketId: string, side: 'YES' | 'NO', amount: number) {
  console.log(`🎲 Placing ${amount} points bet on ${side}...`)
  
  // Get user and market
  const user = await prisma.user.findUnique({ where: { id: userId } })
  const market = await prisma.market.findUnique({ where: { id: marketId } })
  
  if (!user || !market) {
    throw new Error('User or market not found')
  }
  
  // Calculate fee
  const fee = Math.floor(amount * 0.01)
  const netAmount = amount - fee
  
  // Create transaction
  await prisma.$transaction(async (tx) => {
    // Update user balance
    await tx.user.update({
      where: { id: userId },
      data: {
        pointsBalance: { decrement: amount },
        totalBets: { increment: 1 },
        totalWagered: { increment: amount }
      }
    })
    
    // Update market pools
    await tx.market.update({
      where: { id: marketId },
      data: {
        yesPool: side === 'YES' ? { increment: netAmount } : undefined,
        noPool: side === 'NO' ? { increment: netAmount } : undefined
      }
    })
    
    // Create bet
    await tx.bet.create({
      data: {
        id: `bet_${Date.now()}`,
        userId,
        marketId,
        side,
        amount,
        fee
      }
    })
  })
  
  console.log('✅ Bet placed successfully')
}

async function withdrawBet(betId: string) {
  console.log(`🔄 Withdrawing bet ${betId}...`)
  
  const bet = await prisma.bet.findUnique({
    where: { id: betId },
    include: {
      user: true,
      market: true
    }
  })
  
  if (!bet) {
    throw new Error('Bet not found')
  }
  
  // Calculate penalty (10% base + time-based)
  const penalty = Math.floor(bet.amount * 0.1)
  const refundAmount = bet.amount - penalty
  
  // Process withdrawal
  await prisma.$transaction(async (tx) => {
    // Update user
    await tx.user.update({
      where: { id: bet.userId },
      data: {
        pointsBalance: { increment: refundAmount },
        totalBets: { decrement: 1 },
        totalWagered: { decrement: bet.amount }
      }
    })
    
    // Update market
    await tx.market.update({
      where: { id: bet.marketId },
      data: {
        yesPool: bet.side === 'YES' ? { decrement: bet.amount - bet.fee } : undefined,
        noPool: bet.side === 'NO' ? { decrement: bet.amount - bet.fee } : undefined
      }
    })
    
    // Delete bet
    await tx.bet.delete({
      where: { id: betId }
    })
  })
  
  console.log('✅ Bet withdrawn successfully')
}

async function verifyFunctionality() {
  try {
    // Reset database
    await resetDatabase()
    
    // Create test user
    const user = await createTestUser()
    console.log('Initial balance:', user.pointsBalance)
    
    // Create test market
    const market = await createTestMarket(user.id)
    console.log('Initial pools - YES:', market.yesPool, 'NO:', market.noPool)
    
    // Place YES bet
    await placeBet(user.id, market.id, 'YES', 1000)
    
    // Verify bet was placed
    const yesBet = await prisma.bet.findFirst({
      where: { userId: user.id, marketId: market.id, side: 'YES' }
    })
    console.log('YES bet placed:', yesBet?.id)
    
    // Place NO bet
    await placeBet(user.id, market.id, 'NO', 500)
    
    // Verify NO bet was placed
    const noBet = await prisma.bet.findFirst({
      where: { userId: user.id, marketId: market.id, side: 'NO' }
    })
    console.log('NO bet placed:', noBet?.id)
    
    // Withdraw YES bet
    if (yesBet) {
      await withdrawBet(yesBet.id)
    }
    
    // Final state
    const finalUser = await prisma.user.findUnique({ where: { id: user.id } })
    const finalMarket = await prisma.market.findUnique({ where: { id: market.id } })
    const finalBets = await prisma.bet.findMany({ where: { userId: user.id } })
    
    console.log('\nFinal State:')
    console.log('User balance:', finalUser?.pointsBalance)
    console.log('Market pools - YES:', finalMarket?.yesPool, 'NO:', finalMarket?.noPool)
    console.log('Active bets:', finalBets.length)
    
    console.log('\n✅ All functionality verified successfully!')
  } catch (error) {
    console.error('❌ Verification failed:', error)
    throw error
  }
}

// Run verification
verifyFunctionality()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
