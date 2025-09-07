import { prisma } from '@fomora/db'

// Database-backed storage using PostgreSQL
console.log('🚀 Using PostgreSQL database storage')

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
      displayName: user.displayName || `User ${user.walletAddress.slice(0, 6)}`,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      totalBets: user.totalBets || 0,
      totalWagered: user.totalWagered || 0,
      marketsCreated: user.marketsCreated || 0
    }
  },

  async set(walletAddress: string, userData: UserType): Promise<void> {
    try {
      await prisma.user.upsert({
        where: { walletAddress },
        create: {
          id: userData.id,
          walletAddress: userData.walletAddress,
          role: userData.role as any,
          pointsBalance: userData.pointsBalance,
          creditedInitial: userData.creditedInitial,
          ipHash: userData.ipHash,
          displayName: userData.displayName,
          profilePicture: userData.profilePicture,
          totalBets: userData.totalBets,
          totalWagered: userData.totalWagered,
          marketsCreated: userData.marketsCreated,
          createdAt: userData.createdAt
        },
        update: {
          pointsBalance: userData.pointsBalance,
          creditedInitial: userData.creditedInitial,
          ipHash: userData.ipHash,
          displayName: userData.displayName,
          profilePicture: userData.profilePicture,
          totalBets: userData.totalBets,
          totalWagered: userData.totalWagered,
          marketsCreated: userData.marketsCreated
        }
      })
    } catch (error) {
      // If there's a prepared statement error, disconnect and reconnect
      if (error instanceof Error && error.message.includes('prepared statement')) {
        await prisma.$disconnect()
        await prisma.$connect()
        // Retry the operation
        await prisma.user.upsert({
          where: { walletAddress },
          create: {
            id: userData.id,
            walletAddress: userData.walletAddress,
            role: userData.role as any,
            pointsBalance: userData.pointsBalance,
            creditedInitial: userData.creditedInitial,
            ipHash: userData.ipHash,
            displayName: userData.displayName,
            profilePicture: userData.profilePicture,
            totalBets: userData.totalBets,
            totalWagered: userData.totalWagered,
            marketsCreated: userData.marketsCreated,
            createdAt: userData.createdAt
          },
          update: {
            pointsBalance: userData.pointsBalance,
            creditedInitial: userData.creditedInitial,
            ipHash: userData.ipHash,
            displayName: userData.displayName,
            profilePicture: userData.profilePicture,
            totalBets: userData.totalBets,
            totalWagered: userData.totalWagered,
            marketsCreated: userData.marketsCreated
          }
        })
      } else {
        throw error
      }
    }
  },

  async size(): Promise<number> {
    return await prisma.user.count()
  },

  async values(): Promise<UserType[]> {
    const users = await prisma.user.findMany()
    return users.map(user => ({
      id: user.id,
      walletAddress: user.walletAddress,
      role: user.role,
      pointsBalance: user.pointsBalance,
      creditedInitial: user.creditedInitial,
      ipHash: user.ipHash || '',
      displayName: user.displayName || `User ${user.walletAddress.slice(0, 6)}`,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      totalBets: user.totalBets || 0,
      totalWagered: user.totalWagered || 0,
      marketsCreated: user.marketsCreated || 0
    }))
  },

  async entries(): Promise<[string, UserType][]> {
    const users = await this.values()
    return users.map(user => [user.walletAddress, user])
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
      createdAt: new Date(market.createdAt),
      closesAt: new Date(market.closesAt),
      createdBy: market.createdBy,
      outcome: market.resolution as any,
      slug: market.slug,
      image: market.image || undefined
    }
  },

  async set(id: string, marketData: MarketType): Promise<void> {
    try {
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
    } catch (error) {
      // If there's a prepared statement error, disconnect and reconnect
      if (error instanceof Error && error.message.includes('prepared statement')) {
        await prisma.$disconnect()
        await prisma.$connect()
        // Retry the operation
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
      } else {
        throw error
      }
    }
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
      createdAt: new Date(market.createdAt),
      closesAt: new Date(market.closesAt),
      createdBy: market.createdBy,
      outcome: market.resolution as any,
      slug: market.slug,
      image: market.image || undefined
    }))
  },

  async entries(): Promise<[string, MarketType][]> {
    const markets = await this.values()
    return markets.map(market => [market.id, market])
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
    try {
      await prisma.bet.create({
        data: {
          id: betData.id,
          userId: betData.userId,
          marketId: betData.marketId,
          side: betData.side as any,
          amount: betData.amount,
          fee: Math.floor(betData.amount * 0.01) // 1% fee
        }
      })
    } catch (error) {
      // If there's a prepared statement error, disconnect and reconnect
      if (error instanceof Error && error.message.includes('prepared statement')) {
        await prisma.$disconnect()
        await prisma.$connect()
        // Retry the operation
        await prisma.bet.create({
          data: {
            id: betData.id,
            userId: betData.userId,
            marketId: betData.marketId,
            side: betData.side as any,
            amount: betData.amount,
            fee: Math.floor(betData.amount * 0.01) // 1% fee
          }
        })
      } else {
        throw error
      }
    }
  },

  async size(): Promise<number> {
    return await prisma.bet.count()
  },

  async values(): Promise<BetType[]> {
    const bets = await prisma.bet.findMany()
    return bets.map(bet => ({
      id: bet.id,
      userId: bet.userId,
      marketId: bet.marketId,
      side: bet.side as any,
      amount: bet.amount,
      createdAt: bet.createdAt
    }))
  }
}

// Database-backed Map-like interface for FOMO markets
export const fomoMarkets = {
  async get(id: string): Promise<any | undefined> {
    const fomoMarket = await prisma.fomoMarket.findUnique({
      where: { id }
    })
    if (!fomoMarket) return undefined
    
    return {
      id: fomoMarket.id,
      question: fomoMarket.question,
      description: fomoMarket.description,
      category: fomoMarket.category,
      status: fomoMarket.status,
      createdAt: new Date(fomoMarket.createdAt),
      closesAt: new Date(fomoMarket.closesAt),
      yesPool: fomoMarket.yesPool,
      noPool: fomoMarket.noPool,
      totalVolume: fomoMarket.totalVolume,
      participants: fomoMarket.participants,
      trending: fomoMarket.trending,
      slug: fomoMarket.slug,
      image: fomoMarket.image || undefined,
      createdBy: fomoMarket.createdBy || 'fomo-system'
    }
  },

  async set(id: string, fomoMarketData: any): Promise<void> {
    try {
      await prisma.fomoMarket.upsert({
        where: { id },
        create: {
          id: fomoMarketData.id,
          question: fomoMarketData.question,
          description: fomoMarketData.description,
          category: fomoMarketData.category,
          status: fomoMarketData.status || 'OPEN',
          closesAt: fomoMarketData.closesAt,
          yesPool: fomoMarketData.yesPool || 0,
          noPool: fomoMarketData.noPool || 0,
          totalVolume: fomoMarketData.totalVolume || 0,
          participants: fomoMarketData.participants || 0,
          trending: fomoMarketData.trending || false,
          slug: fomoMarketData.slug
        },
        update: {
          question: fomoMarketData.question,
          description: fomoMarketData.description,
          category: fomoMarketData.category,
          status: fomoMarketData.status,
          yesPool: fomoMarketData.yesPool,
          noPool: fomoMarketData.noPool,
          totalVolume: fomoMarketData.totalVolume,
          participants: fomoMarketData.participants,
          trending: fomoMarketData.trending
        }
      })
    } catch (error) {
      // If there's a prepared statement error, disconnect and reconnect
      if (error instanceof Error && error.message.includes('prepared statement')) {
        await prisma.$disconnect()
        await prisma.$connect()
        // Retry the operation
        await prisma.fomoMarket.upsert({
          where: { id },
          create: {
            id: fomoMarketData.id,
            question: fomoMarketData.question,
            description: fomoMarketData.description,
            category: fomoMarketData.category,
            status: fomoMarketData.status || 'OPEN',
            closesAt: fomoMarketData.closesAt,
            yesPool: fomoMarketData.yesPool || 0,
            noPool: fomoMarketData.noPool || 0,
            totalVolume: fomoMarketData.totalVolume || 0,
            participants: fomoMarketData.participants || 0,
            trending: fomoMarketData.trending || false,
            slug: fomoMarketData.slug
          },
          update: {
            question: fomoMarketData.question,
            description: fomoMarketData.description,
            category: fomoMarketData.category,
            status: fomoMarketData.status,
            yesPool: fomoMarketData.yesPool,
            noPool: fomoMarketData.noPool,
            totalVolume: fomoMarketData.totalVolume,
            participants: fomoMarketData.participants,
            trending: fomoMarketData.trending
          }
        })
      } else {
        throw error
      }
    }
  },

  async size(): Promise<number> {
    return await prisma.fomoMarket.count()
  },

  async values(): Promise<any[]> {
    const fomoMarkets = await prisma.fomoMarket.findMany()
    return fomoMarkets.map(fomoMarket => ({
      id: fomoMarket.id,
      question: fomoMarket.question,
      description: fomoMarket.description,
      category: fomoMarket.category,
      status: fomoMarket.status,
      createdAt: new Date(fomoMarket.createdAt),
      closesAt: new Date(fomoMarket.closesAt),
      yesPool: fomoMarket.yesPool,
      noPool: fomoMarket.noPool,
      totalVolume: fomoMarket.totalVolume,
      participants: fomoMarket.participants,
      trending: fomoMarket.trending,
      slug: fomoMarket.slug,
      image: fomoMarket.image || undefined,
      createdBy: fomoMarket.createdBy || 'fomo-system'
    }))
  },

  async has(id: string): Promise<boolean> {
    const fomoMarket = await prisma.fomoMarket.findUnique({
      where: { id }
    })
    return !!fomoMarket
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.fomoMarket.delete({
        where: { id }
      })
      return true
    } catch {
      return false
    }
  },

  async clear(): Promise<void> {
    await prisma.fomoMarket.deleteMany()
  },

  async forEach(callback: (value: any, key: string) => void): Promise<void> {
    const fomoMarkets = await this.values()
    fomoMarkets.forEach(fomoMarket => callback(fomoMarket, fomoMarket.id))
  },

  async entries(): Promise<[string, any][]> {
    const fomoMarkets = await this.values()
    return fomoMarkets.map(market => [market.id, market])
  }
}

console.log('📊 Database storage initialized (including FOMO markets)')
