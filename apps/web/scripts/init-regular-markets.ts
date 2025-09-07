import { prisma } from '@fomora/db'
import { validateMarket, validateClosingTime, isTimeSensitive } from '@/lib/market-validator'

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
    const endOf2025 = new Date(2025, 11, 31) // End of 2025
    const q12026 = new Date(2026, 2, 31) // End of Q1 2026
    const mid2026 = new Date(2026, 5, 30) // Mid 2026

    const proposedMarkets = [
      // Crypto Markets
      {
        question: `Will Bitcoin break $${Math.ceil((prices.bitcoin * 1.25) / 1000) * 1000} before 2026?`,
        description: `Bitcoin needs to reach or exceed $${Math.ceil((prices.bitcoin * 1.25) / 1000) * 1000} (current: $${Math.round(prices.bitcoin)}) on any major exchange before end of 2025.`,
        category: "Crypto",
        closesAt: endOf2025,
        initialPool: 5000
      },
      {
        question: "Will Solana flip Ethereum L2s in TVL?",
        description: "Solana's Total Value Locked must exceed combined TVL of all Ethereum L2s by Q1 2026.",
        category: "Crypto",
        closesAt: q12026,
        initialPool: 4000
      },
      {
        question: "Will USDC market cap exceed USDT?",
        description: "USDC total market capitalization must surpass USDT (Tether) before end of 2025.",
        category: "Crypto",
        closesAt: endOf2025,
        initialPool: 3500
      },
      {
        question: "Will Coinbase acquire Kraken?",
        description: "Coinbase must announce acquisition of Kraken cryptocurrency exchange by Q1 2026.",
        category: "Crypto",
        closesAt: q12026,
        initialPool: 3000
      },
      {
        question: "Will a spot XRP ETF be approved?",
        description: "SEC must approve at least one spot XRP ETF application before July 2026.",
        category: "Crypto",
        closesAt: mid2026,
        initialPool: 4000
      },

      // Tech Markets
      {
        question: "Will Apple release Vision Pro 2?",
        description: "Apple must announce or release second generation Vision Pro headset by Q2 2026.",
        category: "Tech",
        closesAt: mid2026,
        initialPool: 4000
      },
      {
        question: "Will Tesla deliver 500k Cybertrucks?",
        description: "Tesla must deliver at least 500,000 Cybertrucks by end of 2025.",
        category: "Tech",
        closesAt: endOf2025,
        initialPool: 3500
      },
      {
        question: "Will SpaceX reach Mars orbit?",
        description: "SpaceX Starship must successfully enter Mars orbit by Q2 2026.",
        category: "Tech",
        closesAt: mid2026,
        initialPool: 4000
      },
      {
        question: "Will Meta launch AR glasses?",
        description: "Meta must release consumer AR glasses product by Q1 2026.",
        category: "Tech",
        closesAt: q12026,
        initialPool: 3000
      },
      {
        question: "Will Microsoft acquire Unity?",
        description: "Microsoft must complete acquisition of Unity Technologies by Q2 2026.",
        category: "Tech",
        closesAt: mid2026,
        initialPool: 3500
      },

      // Politics & World Events
      {
        question: "Will China GDP exceed US in 2026?",
        description: "China's nominal GDP must surpass US GDP in Q1 2026 official figures.",
        category: "Politics",
        closesAt: q12026,
        initialPool: 5000
      },
      {
        question: "Will Ukraine join NATO?",
        description: "Ukraine must be formally admitted as NATO member by end of 2025.",
        category: "Politics",
        closesAt: endOf2025,
        initialPool: 4000
      },
      {
        question: "Will India land crew on Moon?",
        description: "India must successfully land astronauts on Moon by Q2 2026.",
        category: "Politics",
        closesAt: mid2026,
        initialPool: 3500
      },
      {
        question: "Will EU approve Turkey membership?",
        description: "European Union must approve Turkey's accession by Q1 2026.",
        category: "Politics",
        closesAt: q12026,
        initialPool: 3000
      },
      {
        question: "Will US ban TikTok?",
        description: "US must implement nationwide ban on TikTok by end of 2025.",
        category: "Politics",
        closesAt: endOf2025,
        initialPool: 4000
      },

      // Entertainment & Media
      {
        question: "Will GTA 6 sell 50M copies?",
        description: "GTA 6 must sell 50 million copies within 3 months of 2025 release.",
        category: "Gaming",
        closesAt: q12026,
        initialPool: 4000
      },
      {
        question: "Will Avatar 3 break records?",
        description: "Avatar 3 must exceed Avatar 2's box office earnings in first 3 months.",
        category: "Entertainment",
        closesAt: q12026,
        initialPool: 3500
      },
      {
        question: "Will Disney merge with Netflix?",
        description: "Disney and Netflix must announce merger by Q2 2026.",
        category: "Entertainment",
        closesAt: mid2026,
        initialPool: 3000
      },
      {
        question: "Will YouTube launch gaming platform?",
        description: "YouTube must launch dedicated cloud gaming platform by Q1 2026.",
        category: "Entertainment",
        closesAt: q12026,
        initialPool: 3000
      },
      {
        question: "Will Spotify acquire SoundCloud?",
        description: "Spotify must complete acquisition of SoundCloud by end of 2025.",
        category: "Entertainment",
        closesAt: endOf2025,
        initialPool: 2500
      },

      // Sports
      {
        question: "Will Saudi league become top 5?",
        description: "Saudi Pro League must rank in world's top 5 leagues by UEFA coefficient.",
        category: "Sports",
        closesAt: mid2026,
        initialPool: 4000
      },
      {
        question: "Will Messi play in 2026 World Cup?",
        description: "Lionel Messi must be officially registered in Argentina's 2026 World Cup squad.",
        category: "Sports",
        closesAt: mid2026,
        initialPool: 3500
      },
      {
        question: "Will NBA expand to Europe?",
        description: "NBA must announce European division or team by Q2 2026.",
        category: "Sports",
        closesAt: mid2026,
        initialPool: 3000
      },
      {
        question: "Will F1 add African GP?",
        description: "Formula 1 must confirm African Grand Prix for 2026 season.",
        category: "Sports",
        closesAt: endOf2025,
        initialPool: 3500
      },
      {
        question: "Will Olympics add esports?",
        description: "IOC must approve esports for 2028 Olympics by end of 2025.",
        category: "Sports",
        closesAt: endOf2025,
        initialPool: 3000
      },

      // AI & Innovation
      {
        question: "Will AGI be achieved?",
        description: "Major AI lab must demonstrate AGI meeting standard benchmarks by Q2 2026.",
        category: "AI",
        closesAt: mid2026,
        initialPool: 5000
      },
      {
        question: "Will quantum supremacy be proven?",
        description: "Quantum computer must solve problem impossible for classical computers by 2026.",
        category: "AI",
        closesAt: q12026,
        initialPool: 4000
      },
      {
        question: "Will AI chips beat Moore's Law?",
        description: "AI chip performance must exceed Moore's Law projection by 100% in 2025.",
        category: "AI",
        closesAt: endOf2025,
        initialPool: 3500
      },
      {
        question: "Will Apple release AI model?",
        description: "Apple must release large language model to compete with GPT/Claude by Q1 2026.",
        category: "AI",
        closesAt: q12026,
        initialPool: 4000
      },
      {
        question: "Will AI replace 30% of jobs?",
        description: "Official studies must show AI replacing 30% of current jobs by Q2 2026.",
        category: "AI",
        closesAt: mid2026,
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

    // Validate and create new markets
    for (const marketData of proposedMarkets) {
      // Validate market content
      const contentValidation = validateMarket(marketData.question, marketData.description)
      if (!contentValidation.isValid) {
        console.log(`❌ Skipping market "${marketData.question}": ${contentValidation.reason}`)
        continue
      }

      // Validate closing time
      const timeValidation = validateClosingTime(marketData.closesAt)
      if (!timeValidation.isValid) {
        console.log(`❌ Skipping market "${marketData.question}": ${timeValidation.reason}`)
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