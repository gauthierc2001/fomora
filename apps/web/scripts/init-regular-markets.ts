import { createHash } from 'crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres:OPFJYsSxfQMvHUlQlKpJpzWjjiJSVkUr@shinkansen.proxy.rlwy.net:57939/railway"
})

async function getCryptoPrices() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd')
    if (!response.ok) {
      throw new Error('Failed to fetch crypto prices')
    }
    const data = await response.json()
    return {
      bitcoin: data.bitcoin?.usd || 43000,
      ethereum: data.ethereum?.usd || 2200,
      solana: data.solana?.usd || 100
    }
  } catch (error) {
    console.error('Failed to fetch prices, using defaults:', error)
    return {
      bitcoin: 43000,
      ethereum: 2200,
      solana: 100
    }
  }
}

function createMarketId(question: string, category: string): string {
  const hash = createHash('sha256')
    .update(question + category)
    .digest('hex')
    .slice(0, 12)
  return `market_${category.toLowerCase().replace(/\s+/g, '_')}_${hash}`
}

function createSlug(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60)
}

async function initializeRegularMarkets() {
  try {
    console.log('🚀 Starting regular market initialization...')
    
    // Get current crypto prices
    const prices = await getCryptoPrices()
    console.log('Current prices:', prices)
    
    const now = new Date()
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

    const regularMarkets = [
      {
        question: `Will Bitcoin break $${Math.ceil((prices.bitcoin * 1.15) / 1000) * 1000} this month?`,
        description: `Bitcoin needs to reach or exceed $${Math.ceil((prices.bitcoin * 1.15) / 1000) * 1000} (current: $${Math.round(prices.bitcoin)}) on any major exchange before market close.`,
        category: "Crypto",
        closesAt: in14Days,
        initialPool: 5000
      },
      {
        question: "Will OpenAI release GPT-5 in Q1 2024?",
        description: "OpenAI must officially announce or release GPT-5 before the end of March 2024.",
        category: "AI",
        closesAt: in7Days,
        initialPool: 3000
      },
      {
        question: `Will Ethereum reach $${Math.ceil((prices.ethereum * 1.2) / 100) * 100} by next week?`,
        description: `ETH price must reach or exceed $${Math.ceil((prices.ethereum * 1.2) / 100) * 100} (current: $${Math.round(prices.ethereum)}) on major exchanges.`,
        category: "Crypto",
        closesAt: in7Days,
        initialPool: 4000
      },
      {
        question: "Will Apple announce their AR headset release date?",
        description: "Apple must officially announce a specific release date for their AR/VR headset.",
        category: "Tech",
        closesAt: in3Days,
        initialPool: 2000
      },
      {
        question: "Will Coinbase list a new major L1 token?",
        description: "Coinbase must list a new Layer 1 blockchain token with >$1B market cap.",
        category: "Crypto",
        closesAt: in7Days,
        initialPool: 3500
      }
    ]

    // Create or get system user
    const systemUser = await prisma.user.upsert({
      where: { walletAddress: 'system' },
      create: {
        id: 'system',
        walletAddress: 'system',
        role: 'ADMIN',
        pointsBalance: 1000000,
        creditedInitial: true
      },
      update: {}
    })
    console.log('System user ready:', systemUser.id)

    // Clear existing markets
    await prisma.market.deleteMany()
    console.log('Cleared existing regular markets')

    // Create new markets
    for (const marketData of regularMarkets) {
      // Split initial pool between YES and NO with slight randomization
      const yesRatio = 0.45 + (Math.random() * 0.1) // 45-55% yes
      const totalPool = marketData.initialPool
      const yesPool = Math.floor(totalPool * yesRatio)
      const noPool = totalPool - yesPool

      const market = {
        id: createMarketId(marketData.question, marketData.category),
        slug: createSlug(marketData.question),
        question: marketData.question,
        description: marketData.description,
        category: marketData.category,
        createdBy: systemUser.id,
        status: 'OPEN',
        closesAt: marketData.closesAt,
        createdAt: now,
        yesPool,
        noPool,
        createFee: 100
      }

      await prisma.market.create({
        data: market
      })

      console.log(`✅ Created market: ${market.question}`)
      console.log(`   Pools - YES: ${yesPool}, NO: ${noPool}`)
    }

    console.log('✨ All regular markets initialized successfully!')
  } catch (error) {
    console.error('❌ Market initialization error:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  initializeRegularMarkets()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
