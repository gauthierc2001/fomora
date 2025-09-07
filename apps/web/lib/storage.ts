import { prisma } from '@fomora/db'

// Database-backed storage using Supabase
console.log('🚀 Using Supabase database storage')

// Export types for backward compatibility
export type UserType = {
  id: string
  walletAddress: string
  role: string
  pointsBalance: number
  creditedInitial: boolean
  ipHash: string
  displayName?: string
  profilePicture?: string
  createdAt: Date
  totalBets: number
  totalWagered: number
  marketsCreated: number
}

export type MarketType = {
  id: string
  question: string
  description?: string
  category?: string
  status: 'OPEN' | 'CLOSED' | 'RESOLVED'
  yesPool: number
  noPool: number
  createdAt: Date
  closesAt: Date
  createdBy: string
  outcome?: 'YES' | 'NO'
  slug: string
  image?: string
}

export type BetType = {
  id: string
  userId: string
  marketId: string
  side: 'YES' | 'NO'
  amount: number
  createdAt: Date
}

// Database-backed Map-like interface for users
export const users = {
  async get(walletAddress: string): Promise<UserType | undefined> {
    const user = await prisma.user.findUnique({
      where: { walletAddress }
    })
    if (!user) return undefined
    
    return {
      id: user.id,
      walletAddress: user.walletAddress,
      role: user.role,
      pointsBalance: user.pointsBalance,
      creditedInitial: user.creditedInitial,
      ipHash: user.ipHash || '',
      displayName: `User ${user.walletAddress.slice(0, 6)}`,
      profilePicture: undefined,
      createdAt: user.createdAt,
      totalBets: 0, // TODO: Calculate from bets
      totalWagered: 0, // TODO: Calculate from bets
      marketsCreated: 0 // TODO: Calculate from markets
    }
  },

  async set(walletAddress: string, userData: UserType): Promise<void> {
    await prisma.user.upsert({
      where: { walletAddress },
      create: {
        walletAddress: userData.walletAddress,
        role: userData.role as any,
        pointsBalance: userData.pointsBalance,
        creditedInitial: userData.creditedInitial,
        ipHash: userData.ipHash
      },
      update: {
        pointsBalance: userData.pointsBalance,
        creditedInitial: userData.creditedInitial,
        ipHash: userData.ipHash
      }
    })
  },

  async size(): Promise<number> {
    return await prisma.user.count()
  }
}

// Database-backed Map-like interface for markets
export const markets = {
  async get(id: string): Promise<MarketType | undefined> {
    const market = await prisma.market.findUnique({
      where: { id }
    })
    if (!market) return undefined
    
    return {
      id: market.id,
      question: market.question,
      description: market.description || undefined,
      category: market.category || undefined,
      status: market.status as any,
      yesPool: market.yesPool,
      noPool: market.noPool,
      createdAt: market.createdAt,
      closesAt: market.closesAt,
      createdBy: market.createdBy,
      outcome: market.resolution as any,
      slug: market.slug
    }
  },

  async set(id: string, marketData: MarketType): Promise<void> {
    await prisma.market.upsert({
      where: { id },
      create: {
        id: marketData.id,
        slug: marketData.slug,
        question: marketData.question,
        description: marketData.description,
        category: marketData.category,
        createdBy: marketData.createdBy,
        status: marketData.status as any,
        closesAt: marketData.closesAt,
        yesPool: marketData.yesPool,
        noPool: marketData.noPool
      },
      update: {
        question: marketData.question,
        description: marketData.description,
        category: marketData.category,
        status: marketData.status as any,
        yesPool: marketData.yesPool,
        noPool: marketData.noPool
      }
    })
  },

  async size(): Promise<number> {
    return await prisma.market.count()
  },

  async values(): Promise<MarketType[]> {
    const markets = await prisma.market.findMany()
    return markets.map(market => ({
      id: market.id,
      question: market.question,
      description: market.description || undefined,
      category: market.category || undefined,
      status: market.status as any,
      yesPool: market.yesPool,
      noPool: market.noPool,
      createdAt: market.createdAt,
      closesAt: market.closesAt,
      createdBy: market.createdBy,
      outcome: market.resolution as any,
      slug: market.slug
    }))
  }
}

// Database-backed Map-like interface for bets
export const bets = {
  async get(id: string): Promise<BetType | undefined> {
    const bet = await prisma.bet.findUnique({
      where: { id }
    })
    if (!bet) return undefined
    
    return {
      id: bet.id,
      userId: bet.userId,
      marketId: bet.marketId,
      side: bet.side as any,
      amount: bet.amount,
      createdAt: bet.createdAt
    }
  },

  async set(id: string, betData: BetType): Promise<void> {
    await prisma.bet.create({
      data: {
        id: betData.id,
        userId: betData.userId,
        marketId: betData.marketId,
        side: betData.side as any,
        amount: betData.amount,
        fee: 0 // Default fee
      }
    })
  },

  async size(): Promise<number> {
    return await prisma.bet.count()
  }
}

// For FOMO markets, use a simple in-memory Map for now (can be moved to DB later)
export const fomoMarkets = new Map<string, any>()

console.log('📊 Database storage initialized')
