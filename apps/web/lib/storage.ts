// Import persistent file-based storage
import { 
  persistentUsers, 
  persistentMarkets, 
  persistentBets,
  persistentFomoMarkets,
  type User,
  type Market,
  type Bet
} from './persistent-storage'

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

// Export persistent storage as the main storage (backward compatible)
export const users = persistentUsers as any
export const markets = persistentMarkets as any
export const bets = persistentBets as any

// FOMO Markets - now using persistent storage instead of in-memory Map
export const fomoMarkets = persistentFomoMarkets as any

console.log('🚀 Using persistent file-based storage')
console.log(`📊 Loaded: ${users.size} users, ${markets.size} markets, ${bets.size} bets, ${fomoMarkets.size} FOMO markets`)
