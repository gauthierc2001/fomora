import { createHash } from 'crypto'
import { PrismaClient } from '@prisma/client'
import { newsService } from '@/lib/news-service'

const prisma = new PrismaClient()

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
    const inQ4 = new Date(2025, 11, 31) // End of Q4 2025

    const proposedMarkets = [
      // Crypto Markets
      {
        question: `Will Bitcoin break $${Math.ceil((prices.bitcoin * 1.15) / 1000) * 1000} by October?`,
        description: `Bitcoin needs to reach or exceed $${Math.ceil((prices.bitcoin * 1.15) / 1000) * 1000} (current: $${Math.round(prices.bitcoin)}) on any major exchange before market close.`,
        category: "Crypto",
        closesAt: in14Days,
        initialPool: 5000
      },
      {
        question: "Will Solana TVL exceed Ethereum L2s?",
        description: "Solana's Total Value Locked must exceed the combined TVL of all Ethereum L2s.",
        category: "Crypto",
        closesAt: in14Days,
        initialPool: 3000
      },
      {
        question: "Will Coinbase acquire Binance US?",
        description: "Coinbase must announce acquisition of Binance's US operations.",
        category: "Crypto",
        closesAt: in14Days,
        initialPool: 3000
      },

      // Tech Markets
      {
        question: "Will Claude 4 outperform GPT-5?",
        description: "Claude 4 must score higher than GPT-5 in majority of standard benchmarks.",
        category: "Tech",
        closesAt: in14Days,
        initialPool: 4000
      },
      {
        question: "Will Apple Vision Pro 2 launch in 2025?",
        description: "Apple must announce or release second generation Vision Pro this year.",
        category: "Tech",
        closesAt: inQ4,
        initialPool: 3500
      },
      {
        question: "Will Tesla Roadster finally ship?",
        description: "Tesla must begin customer deliveries of the new Roadster in 2025.",
        category: "Tech",
        closesAt: inQ4,
        initialPool: 3000
      },
      {
        question: "Will SpaceX achieve orbital Starship refueling?",
        description: "SpaceX must successfully demonstrate orbital refueling between two Starships.",
        category: "Tech",
        closesAt: inQ4,
        initialPool: 3000
      },

      // Politics & World Events
      {
        question: "Will US pass comprehensive AI regulation?",
        description: "Congress must pass and President must sign federal AI regulation bill.",
        category: "Politics",
        closesAt: inQ4,
        initialPool: 5000
      },
      {
        question: "Will China GDP growth exceed 5%?",
        description: "China's official GDP growth for Q3 2025 must exceed 5% year-over-year.",
        category: "Politics",
        closesAt: in14Days,
        initialPool: 3000
      },
      {
        question: "Will EU approve new member state?",
        description: "European Union must approve accession of a new member state in 2025.",
        category: "Politics",
        closesAt: inQ4,
        initialPool: 3500
      },
      {
        question: "Will Fed cut rates in October?",
        description: "Federal Reserve must announce interest rate cut at October FOMC meeting.",
        category: "Politics",
        closesAt: in14Days,
        initialPool: 3000
      },

      // Entertainment & Media
      {
        question: "Will GTA 6 pre-orders break records?",
        description: "GTA 6 must break all-time video game pre-order record before 2025 release.",
        category: "Gaming",
        closesAt: in14Days,
        initialPool: 4000
      },
      {
        question: "Will Dune 3 be announced?",
        description: "Warner Bros must officially announce Dune: Part Three production.",
        category: "Entertainment",
        closesAt: in14Days,
        initialPool: 3000
      },
      {
        question: "Will Disney acquire Netflix?",
        description: "Disney must announce acquisition or merger with Netflix.",
        category: "Entertainment",
        closesAt: inQ4,
        initialPool: 3500
      },
      {
        question: "Will Prime Video surpass Netflix?",
        description: "Amazon Prime Video must surpass Netflix in total streaming hours.",
        category: "Entertainment",
        closesAt: inQ4,
        initialPool: 2500
      },

      // Sports
      {
        question: "Will Man City win Champions League again?",
        description: "Manchester City must win 2024-25 UEFA Champions League.",
        category: "Sports",
        closesAt: in14Days,
        initialPool: 4000
      },
      {
        question: "Will Haaland break season goal record?",
        description: "Erling Haaland must break Premier League single-season goal record (34).",
        category: "Sports",
        closesAt: in14Days,
        initialPool: 3500
      },
      {
        question: "Will Saudi league sign top 5 player?",
        description: "Saudi Pro League must sign a current FIFA top 5 ranked player.",
        category: "Sports",
        closesAt: in14Days,
        initialPool: 4000
      },
      {
        question: "Will Alcaraz win 3 Grand Slams?",
        description: "Carlos Alcaraz must win at least 3 Grand Slam titles in 2025.",
        category: "Sports",
        closesAt: inQ4,
        initialPool: 3500
      },

      // AI & Innovation
      {
        question: "Will AGI be achieved in 2025?",
        description: "A major AI lab must demonstrate AGI capabilities meeting standard criteria.",
        category: "AI",
        closesAt: inQ4,
        initialPool: 4000
      },
      {
        question: "Will Google open-source Gemini?",
        description: "Google must release open-source version of Gemini model.",
        category: "AI",
        closesAt: in14Days,
        initialPool: 3500
      },
      {
        question: "Will AI chip prices drop 50%?",
        description: "Average market price for AI training GPUs must fall 50% from January levels.",
        category: "AI",
        closesAt: in14Days,
        initialPool: 3000
      },
      {
        question: "Will Apple launch AI assistant?",
        description: "Apple must release major AI assistant to compete with ChatGPT/Claude.",
        category: "AI",
        closesAt: inQ4,
        initialPool: 3500
      },
      {
        question: "Will Anthropic IPO in 2025?",
        description: "Anthropic must complete initial public offering on major exchange.",
        category: "AI",
        closesAt: inQ4,
        initialPool: 3000
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

    // Validate and create new markets
    for (const marketData of proposedMarkets) {
      // Validate market against news
      const validation = await newsService.validateMarket(
        marketData.question,
        marketData.description
      )

      if (!validation.isValid) {
        console.log(`❌ Skipping market "${marketData.question}": ${validation.reason}`)
        continue
      }

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