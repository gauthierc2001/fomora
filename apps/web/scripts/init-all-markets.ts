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

function getMarketImage(category: string): string {
  const baseUrl = 'https://placehold.co/400x300'
  const categoryColors = {
    'Crypto': 'FF6B6B',
    'Tech': 'FF9F43',
    'Social': '6C5CE7',
    'Gaming': '00B894',
    'NFT': 'FDCB6E',
    'AI': 'A855F7'
  }
  
  const color = categoryColors[category as keyof typeof categoryColors] || 'A0A0A0'
  return `${baseUrl}/${color}/FFFFFF?text=${encodeURIComponent(category)}`
}

async function initializeAllMarkets() {
  try {
    console.log('🚀 Starting market initialization...')
    
    // Get current crypto prices
    const prices = await getCryptoPrices()
    console.log('Current prices:', prices)
    
    const now = new Date()
    const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000)
    const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000)
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000)

    const liveMarkets = [
      {
        question: `Will BTC pump ${Math.round(prices.bitcoin * 0.01)}$ in 15min?`,
        description: `Bitcoin price must increase by $${Math.round(prices.bitcoin * 0.01)} or more from current $${Math.round(prices.bitcoin)} in the next 15 minutes.`,
        category: "FOMO",
        closesAt: in15Minutes,
        initialPool: 2000
      },
      {
        question: "Next big X crypto trend?",
        description: "Will any crypto-related hashtag trend in top 3 on X (Twitter) in the next 30 minutes?",
        category: "Viral",
        closesAt: in30Minutes,
        initialPool: 1500
      },
      {
        question: `SOL to ${Math.round(prices.solana * 1.05)} soon?`,
        description: `Solana must hit $${Math.round(prices.solana * 1.05)} (current: $${Math.round(prices.solana)}) in the next hour.`,
        category: "FOMO",
        closesAt: in1Hour,
        initialPool: 3000
      },
      {
        question: "Memecoin 50% pump incoming?",
        description: "Any memecoin in top 100 must pump 50% or more in the next 30 minutes.",
        category: "Hype",
        closesAt: in30Minutes,
        initialPool: 2500
      },
      {
        question: "Influencer FUD in 1h?",
        description: "Any crypto influencer with 100k+ followers posts FUD about current market in next hour.",
        category: "Buzz",
        closesAt: in1Hour,
        initialPool: 1000
      }
    ]

    // Clear existing markets
    await prisma.fomoMarket.deleteMany()
    console.log('Cleared existing FOMO markets')

    // Create new markets
    for (const marketData of liveMarkets) {
      // Split initial pool between YES and NO with slight randomization
      const yesRatio = 0.45 + (Math.random() * 0.1) // 45-55% yes
      const totalPool = marketData.initialPool
      const yesPool = Math.floor(totalPool * yesRatio)
      const noPool = totalPool - yesPool

      const market = {
        id: createMarketId(marketData.question, marketData.category),
        question: marketData.question,
        description: marketData.description,
        category: marketData.category,
        image: getMarketImage(marketData.category),
        slug: createSlug(marketData.question),
        status: 'OPEN',
        yesPool,
        noPool,
        totalVolume: totalPool,
        participants: Math.floor(totalPool / 500), // Simulate some participants
        trending: true,
        createdAt: now,
        closesAt: marketData.closesAt,
        createdBy: 'fomo-system'
      }

      await prisma.fomoMarket.create({
        data: market
      })

      console.log(`✅ Created market: ${market.question}`)
      console.log(`   Pools - YES: ${yesPool}, NO: ${noPool}`)
    }

    console.log('✨ All markets initialized successfully!')
  } catch (error) {
    console.error('❌ Market initialization error:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  initializeAllMarkets()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
