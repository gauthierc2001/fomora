// Import storage based on environment
let users: Map<string, any>
let markets: Map<string, any>
let bets: Map<string, any>
let fomoMarkets: Map<string, any>

// Use in-memory storage for production (Vercel serverless), file storage for development
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  // In-memory storage for production
  users = new Map()
  markets = new Map()
  bets = new Map()
  fomoMarkets = new Map()
  
  console.log('🚀 Using in-memory storage (production)')
} else {
  // File-based storage for development
  const { 
    persistentUsers, 
    persistentMarkets, 
    persistentBets,
    persistentFomoMarkets
  } = require('./persistent-storage')
  
  users = persistentUsers
  markets = persistentMarkets
  bets = persistentBets
  fomoMarkets = persistentFomoMarkets
  
  console.log('🚀 Using persistent file-based storage (development)')
}

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

// Export the storage instances
export { users, markets, bets, fomoMarkets }

console.log(`📊 Loaded: ${users.size} users, ${markets.size} markets, ${bets.size} bets, ${fomoMarkets.size} FOMO markets`)
