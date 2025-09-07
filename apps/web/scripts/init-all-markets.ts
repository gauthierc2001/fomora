import { createHash } from 'crypto'
import { prisma } from '@fomora/db'

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
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000)
    const in72Hours = new Date(now.getTime() + 72 * 60 * 60 * 1000)

    const liveMarkets = [
      {
        question: `Will Bitcoin break $${Math.ceil((prices.bitcoin * 1.15) / 1000) * 1000} this week?`,
        description: `Bitcoin needs to reach or exceed $${Math.ceil((prices.bitcoin * 1.15) / 1000) * 1000} (current: $${Math.round(prices.bitcoin)}) on any major exchange before market close.`,
        category: "Crypto",
        closesAt: in72Hours,
        initialPool: 5000
      },
      {
        question: "Will ChatGPT reach 200M daily users?",
        description: "OpenAI must officially announce or reliable sources must confirm ChatGPT reaching 200M daily active users.",
        category: "AI",
        closesAt: in48Hours,
        initialPool: 3000
      },
      {
        question: `Will Solana reach $${Math.ceil((prices.solana * 1.25) / 1) * 1} in 24h?`,
        description: `Solana price must reach or exceed $${Math.ceil((prices.solana * 1.25) / 1) * 1} (current: $${Math.round(prices.solana)}) on major exchanges within 24 hours.`,
        category: "Crypto",
        closesAt: in24Hours,
        initialPool: 4000
      },
      {
        question: "Will Reddit launch their NFT marketplace?",
        description: "Reddit must officially announce or launch their dedicated NFT marketplace platform.",
        category: "NFT",
        closesAt: in72Hours,
        initialPool: 2000
      },
      {
        question: "Will GTA 6 trailer hit 100M views in 24h?",
        description: "The official GTA 6 trailer must reach 100M views on YouTube within 24 hours of release.",
        category: "Gaming",
        closesAt: in48Hours,
        initialPool: 3500
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
