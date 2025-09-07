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
      // Crypto Markets
      {
        question: `Will Bitcoin break $${Math.ceil((prices.bitcoin * 1.15) / 1000) * 1000} this month?`,
        description: `Bitcoin needs to reach or exceed $${Math.ceil((prices.bitcoin * 1.15) / 1000) * 1000} (current: $${Math.round(prices.bitcoin)}) on any major exchange before market close.`,
        category: "Crypto",
        closesAt: in14Days,
        initialPool: 5000
      },
      {
        question: `Will ETH hit $${Math.ceil((prices.ethereum * 1.2) / 100) * 100} by next week?`,
        description: `ETH price must reach or exceed $${Math.ceil((prices.ethereum * 1.2) / 100) * 100} (current: $${Math.round(prices.ethereum)}) on major exchanges.`,
        category: "Crypto",
        closesAt: in7Days,
        initialPool: 4000
      },
      {
        question: "Will Binance list BONK?",
        description: "Binance must officially announce or list BONK token for spot trading.",
        category: "Crypto",
        closesAt: in7Days,
        initialPool: 3000
      },
      {
        question: "Will SEC approve spot ETH ETF in Q1?",
        description: "SEC must approve at least one spot Ethereum ETF application before April 1st.",
        category: "Crypto",
        closesAt: in14Days,
        initialPool: 5000
      },
      {
        question: "Will Coinbase add new L2 token?",
        description: "Coinbase must list a new Layer 2 token (zkSync, StarkNet, etc.) for trading.",
        category: "Crypto",
        closesAt: in7Days,
        initialPool: 3000
      },

      // Tech Markets
      {
        question: "Will OpenAI release GPT-5 in Q1?",
        description: "OpenAI must officially announce or release GPT-5 before April 1st.",
        category: "Tech",
        closesAt: in14Days,
        initialPool: 4000
      },
      {
        question: "Will Apple Vision Pro sell out?",
        description: "Apple Vision Pro must be sold out (shipping dates pushed) within 24h of preorders.",
        category: "Tech",
        closesAt: in7Days,
        initialPool: 3500
      },
      {
        question: "Will Tesla announce new model?",
        description: "Tesla must officially announce a new vehicle model with specs and timeline.",
        category: "Tech",
        closesAt: in14Days,
        initialPool: 3000
      },
      {
        question: "Will Meta release Twitter competitor?",
        description: "Meta must launch a new text-based social platform to compete with X/Twitter.",
        category: "Tech",
        closesAt: in7Days,
        initialPool: 2500
      },
      {
        question: "Will Microsoft acquire Unity?",
        description: "Microsoft must announce plans to acquire Unity Technologies.",
        category: "Tech",
        closesAt: in14Days,
        initialPool: 3000
      },

      // Politics & World Events
      {
        question: "Will Trump win Iowa caucus?",
        description: "Donald Trump must win the Iowa Republican caucus with >40% of votes.",
        category: "Politics",
        closesAt: in7Days,
        initialPool: 5000
      },
      {
        question: "Will UK call early election?",
        description: "UK PM must announce early general election before scheduled 2024 date.",
        category: "Politics",
        closesAt: in14Days,
        initialPool: 3000
      },
      {
        question: "Will EU pass AI Act in Q1?",
        description: "European Union must fully pass comprehensive AI regulation by April.",
        category: "Politics",
        closesAt: in14Days,
        initialPool: 3500
      },
      {
        question: "Will China cut rates again?",
        description: "PBOC must announce another interest rate cut to stimulate economy.",
        category: "Politics",
        closesAt: in7Days,
        initialPool: 3000
      },
      {
        question: "Will US govt avoid shutdown?",
        description: "US Congress must pass funding bill before current deadline.",
        category: "Politics",
        closesAt: in7Days,
        initialPool: 4000
      },

      // Entertainment & Media
      {
        question: "Will GTA 6 trailer break records?",
        description: "Next GTA 6 trailer must break YouTube 24h view record (Currently 100M).",
        category: "Gaming",
        closesAt: in7Days,
        initialPool: 4000
      },
      {
        question: "Will Dune 2 get 90%+ on RT?",
        description: "Dune: Part Two must achieve 90% or higher critic score on Rotten Tomatoes.",
        category: "Entertainment",
        closesAt: in14Days,
        initialPool: 3000
      },
      {
        question: "Will Taylor Swift announce tour?",
        description: "Taylor Swift must announce new concert tour dates for 2024.",
        category: "Entertainment",
        closesAt: in7Days,
        initialPool: 3500
      },
      {
        question: "Will Netflix buy AMC?",
        description: "Netflix must announce acquisition of AMC Networks.",
        category: "Entertainment",
        closesAt: in14Days,
        initialPool: 2500
      },
      {
        question: "Will Disney+ pass Netflix subs?",
        description: "Disney+ must surpass Netflix in total global subscribers this quarter.",
        category: "Entertainment",
        closesAt: in14Days,
        initialPool: 3000
      },

      // Sports
      {
        question: "Will Chiefs reach Super Bowl?",
        description: "Kansas City Chiefs must qualify for Super Bowl LVIII.",
        category: "Sports",
        closesAt: in7Days,
        initialPool: 4000
      },
      {
        question: "Will Mbappe join Real Madrid?",
        description: "Kylian Mbappe must officially sign or announce move to Real Madrid.",
        category: "Sports",
        closesAt: in14Days,
        initialPool: 3500
      },
      {
        question: "Will Lakers trade for star?",
        description: "LA Lakers must acquire All-Star level player before trade deadline.",
        category: "Sports",
        closesAt: in7Days,
        initialPool: 3000
      },
      {
        question: "Will Man City win EPL again?",
        description: "Manchester City must be mathematically confirmed as EPL champions.",
        category: "Sports",
        closesAt: in14Days,
        initialPool: 4000
      },
      {
        question: "Will Djokovic win Aus Open?",
        description: "Novak Djokovic must win Australian Open 2024 men's singles title.",
        category: "Sports",
        closesAt: in7Days,
        initialPool: 3500
      },

      // NFTs & Gaming
      {
        question: "Will Reddit launch NFT marketplace?",
        description: "Reddit must officially launch dedicated NFT marketplace platform.",
        category: "NFT",
        closesAt: in14Days,
        initialPool: 3000
      },
      {
        question: "Will BAYC floor hit 100 ETH?",
        description: "Bored Ape Yacht Club floor price must reach 100 ETH on OpenSea.",
        category: "NFT",
        closesAt: in7Days,
        initialPool: 2500
      },
      {
        question: "Will Minecraft allow NFTs?",
        description: "Minecraft must officially announce NFT integration or support.",
        category: "NFT",
        closesAt: in14Days,
        initialPool: 2000
      },
      {
        question: "Will Steam accept crypto?",
        description: "Steam must announce cryptocurrency payment support for games.",
        category: "Gaming",
        closesAt: in14Days,
        initialPool: 3000
      },
      {
        question: "Will PS6 be announced?",
        description: "Sony must officially announce PlayStation 6 development.",
        category: "Gaming",
        closesAt: in7Days,
        initialPool: 2500
      },

      // AI & Innovation
      {
        question: "Will Claude beat GPT-4?",
        description: "Claude 3 must outperform GPT-4 in majority of benchmark tests.",
        category: "AI",
        closesAt: in14Days,
        initialPool: 4000
      },
      {
        question: "Will Google release Gemini Pro?",
        description: "Google must release Gemini Pro API for public use.",
        category: "AI",
        closesAt: in7Days,
        initialPool: 3500
      },
      {
        question: "Will AI chip shortage end?",
        description: "NVIDIA must announce H100 GPU wait times reduced to under 3 months.",
        category: "AI",
        closesAt: in14Days,
        initialPool: 3000
      },
      {
        question: "Will Apple join AI race?",
        description: "Apple must announce major AI product or platform.",
        category: "AI",
        closesAt: in7Days,
        initialPool: 3500
      },
      {
        question: "Will EU ban AI models?",
        description: "EU must announce ban or major restriction on specific AI models.",
        category: "AI",
        closesAt: in14Days,
        initialPool: 3000
      },
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

    // Clear existing bets and markets
    await prisma.bet.deleteMany()
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
