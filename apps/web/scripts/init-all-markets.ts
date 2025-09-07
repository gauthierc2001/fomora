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
      // Price Action FOMO (15min-1h)
      {
        question: `BTC ${Math.round(prices.bitcoin * 0.01)}$ pump in 15min?`,
        description: `Bitcoin price must increase by $${Math.round(prices.bitcoin * 0.01)} from current $${Math.round(prices.bitcoin)} in 15 minutes.`,
        category: "FOMO",
        closesAt: in15Minutes,
        initialPool: 2000
      },
      {
        question: `ETH to ${Math.round(prices.ethereum * 1.02)} in 30min?`,
        description: `ETH must reach $${Math.round(prices.ethereum * 1.02)} (current: $${Math.round(prices.ethereum)}) in next 30 minutes.`,
        category: "FOMO",
        closesAt: in30Minutes,
        initialPool: 1500
      },
      {
        question: `SOL ${Math.round(prices.solana * 1.05)} soon?`,
        description: `Solana must hit $${Math.round(prices.solana * 1.05)} (current: $${Math.round(prices.solana)}) in next hour.`,
        category: "FOMO",
        closesAt: in1Hour,
        initialPool: 3000
      },
      {
        question: "BONK 50% pump incoming?",
        description: "BONK token must pump 50% or more in the next 30 minutes.",
        category: "FOMO",
        closesAt: in30Minutes,
        initialPool: 2000
      },
      {
        question: "New ATH for BTC soon?",
        description: "Bitcoin must set new all-time high above $69,000 in next hour.",
        category: "FOMO",
        closesAt: in1Hour,
        initialPool: 5000
      },

      // Viral & Social (15-30min)
      {
        question: "Next crypto trend on X?",
        description: "Any crypto hashtag must trend top 3 on X (Twitter) in 30 minutes.",
        category: "Viral",
        closesAt: in30Minutes,
        initialPool: 1500
      },
      {
        question: "100k likes WAGMI post?",
        description: "Any crypto post with 'WAGMI' must hit 100k likes in 15 minutes.",
        category: "Viral",
        closesAt: in15Minutes,
        initialPool: 1000
      },
      {
        question: "Elon tweet moves DOGE?",
        description: "Elon Musk must tweet about DOGE causing >5% price move in 30min.",
        category: "Viral",
        closesAt: in30Minutes,
        initialPool: 2500
      },
      {
        question: "New viral trading meme?",
        description: "Trading/crypto meme must reach 50k likes in next 15 minutes.",
        category: "Viral",
        closesAt: in15Minutes,
        initialPool: 1500
      },
      {
        question: "CT space hits 100k?",
        description: "Any Crypto Twitter space must reach 100k listeners in 30min.",
        category: "Viral",
        closesAt: in30Minutes,
        initialPool: 2000
      },

      // Hype & FOMO (30min-1h)
      {
        question: "New memecoin 100x?",
        description: "Any new memecoin must pump 100x from launch in next hour.",
        category: "Hype",
        closesAt: in1Hour,
        initialPool: 3000
      },
      {
        question: "NFT floor doubles?",
        description: "Any top 100 NFT collection floor price must double in 30min.",
        category: "Hype",
        closesAt: in30Minutes,
        initialPool: 2000
      },
      {
        question: "Exchange token pumps?",
        description: "Any CEX token (BNB, OKB, etc.) must pump 20% in next hour.",
        category: "Hype",
        closesAt: in1Hour,
        initialPool: 2500
      },
      {
        question: "L2 gas fees spike?",
        description: "Any L2 must see 5x increase in gas fees in next 30 minutes.",
        category: "Hype",
        closesAt: in30Minutes,
        initialPool: 1500
      },
      {
        question: "DeFi TVL explosion?",
        description: "Any DeFi protocol TVL must increase 50% in next hour.",
        category: "Hype",
        closesAt: in1Hour,
        initialPool: 2000
      },

      // Buzz & Drama (15min-1h)
      {
        question: "Influencer drama soon?",
        description: "Major crypto influencer must start Twitter drama in 15min.",
        category: "Buzz",
        closesAt: in15Minutes,
        initialPool: 1000
      },
      {
        question: "Exchange FUD incoming?",
        description: "Major FUD about any top 5 exchange in next 30 minutes.",
        category: "Buzz",
        closesAt: in30Minutes,
        initialPool: 2000
      },
      {
        question: "Dev team rugs?",
        description: "Any tracked project team must abandon/rug in next hour.",
        category: "Buzz",
        closesAt: in1Hour,
        initialPool: 1500
      },
      {
        question: "CEX lists meme?",
        description: "Major exchange must list new memecoin in next 30 minutes.",
        category: "Buzz",
        closesAt: in30Minutes,
        initialPool: 2000
      },
      {
        question: "Whale dumps incoming?",
        description: "Whale must dump >$10M worth of any top 20 coin in 15min.",
        category: "Buzz",
        closesAt: in15Minutes,
        initialPool: 1500
      },

      // Quick Trends (15-30min)
      {
        question: "gm trend explodes?",
        description: "'gm' must become #1 trending topic on CT in 15 minutes.",
        category: "Trending",
        closesAt: in15Minutes,
        initialPool: 1000
      },
      {
        question: "New copypasta viral?",
        description: "New crypto copypasta must get 1000+ reposts in 30min.",
        category: "Trending",
        closesAt: in30Minutes,
        initialPool: 1500
      },
      {
        question: "Wojak meme boom?",
        description: "New Wojak trading meme must go viral in next 15 minutes.",
        category: "Trending",
        closesAt: in15Minutes,
        initialPool: 1000
      },
      {
        question: "CT spaces war?",
        description: "Multiple 10k+ listener CT spaces must clash in 30min.",
        category: "Trending",
        closesAt: in30Minutes,
        initialPool: 2000
      },
      {
        question: "New trading term?",
        description: "New trading slang term must trend on CT in 15 minutes.",
        category: "Trending",
        closesAt: in15Minutes,
        initialPool: 1500
      },

      // Meta FOMO (30min-1h)
      {
        question: "100 bets in 15min?",
        description: "This market must get 100+ bets in next 15 minutes.",
        category: "Meta",
        closesAt: in15Minutes,
        initialPool: 2000
      },
      {
        question: "FOMO markets trend?",
        description: "FOMO markets must be mentioned in viral CT post in 30min.",
        category: "Meta",
        closesAt: in30Minutes,
        initialPool: 1500
      },
      {
        question: "Degen apes in?",
        description: "Total betting volume must 2x in next hour across platform.",
        category: "Meta",
        closesAt: in1Hour,
        initialPool: 3000
      },
      {
        question: "New gambling term?",
        description: "New betting/gambling term must trend on CT in 30min.",
        category: "Meta",
        closesAt: in30Minutes,
        initialPool: 1000
      },
      {
        question: "Copium levels peak?",
        description: "'Copium' mentions must hit daily high in next 15min.",
        category: "Meta",
        closesAt: in15Minutes,
        initialPool: 1500
      },
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
