import { prisma } from '@fomora/db'
import { createHash } from 'crypto'

function createMarketId(question: string, category: string, suffix?: string): string {
  const normalizedQuestion = question
    .replace(/\$[\d,]+\.?\d*/g, '$PRICE')
    .replace(/[\d,]+\.?\d*%/g, 'X%')
    .replace(/\s+/g, ' ')
    .trim()
  
  const hash = createHash('sha256').update(normalizedQuestion + category + (suffix || 'fomo')).digest('hex').slice(0, 12)
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

function getRandomInitialPools() {
  const total = Math.floor(Math.random() * 10000) + 5000 // 5k-15k total
  const yesRatio = 0.3 + Math.random() * 0.4 // 30-70% yes
  
  return {
    yesPool: Math.floor(total * yesRatio),
    noPool: Math.floor(total * (1 - yesRatio))
  }
}

function getMarketImage(category: string): string {
  const categoryImages = {
    'FOMO': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/black/generic.svg',
    'Hype': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/black/fire.svg',
    'Viral': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/black/rocket.svg',
    'Trending': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/black/trending-up.svg',
    'Buzz': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/black/bell.svg',
    'Meta': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/black/infinity.svg'
  }
  
  return categoryImages[category as keyof typeof categoryImages] || categoryImages['FOMO']
}

export async function populateFomoMarkets() {
  try {
    console.log('🔥 Starting FOMO market population...')
    
    const now = new Date()
    const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000)
    const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000)
    const in60Minutes = new Date(now.getTime() + 60 * 60 * 1000)
    const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000)
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const fomoSpecialMarkets = [
      // Quick FOMO Markets (15-60 minutes)
      {
        question: "Will Bitcoin move $1000+ in the next 15 minutes?",
        description: "Pure FOMO volatility - anything can happen in crypto.",
        category: "FOMO",
        closesAt: in15Minutes
      },
      {
        question: "Will 'WAGMI' trend on crypto Twitter in 30 minutes?",
        description: "Classic crypto FOMO expression during market pumps.",
        category: "FOMO",
        closesAt: in30Minutes
      },
      {
        question: "Will any meme coin pump 1000% in the next hour?",
        description: "Peak degeneracy hours for astronomical meme coin gains.",
        category: "Hype", 
        closesAt: in60Minutes
      },
      {
        question: "Will 'To the moon' get tweeted 1000+ times in 30 minutes?",
        description: "Peak FOMO expression during explosive price action.",
        category: "Viral",
        closesAt: in30Minutes
      },

      // Viral Content & Social Media
      {
        question: "Will a TikTok video hit 10M views in the next 6 hours?",
        description: "Peak FOMO time for viral content explosion on TikTok.",
        category: "Viral",
        closesAt: in12Hours
      },
      {
        question: "Will someone buy an NFT for over $100K in next 12 hours?",
        description: "Peak NFT FOMO territory with whale purchases.",
        category: "FOMO",
        closesAt: in12Hours
      },
      {
        question: "Will any stock go up 50%+ in pre-market trading?",
        description: "After-hours FOMO can create explosive pre-market moves.",
        category: "Hype",
        closesAt: in12Hours
      },

      // 24-Hour Markets
      {
        question: "Will Elon tweet about Dogecoin today?",
        description: "Classic FOMO trigger - Elon's crypto tweets move markets instantly.",
        category: "FOMO",
        closesAt: in24Hours
      },
      {
        question: "Will 'Diamond Hands' get 100K mentions on Reddit today?",
        description: "Peak FOMO terminology during market volatility.",
        category: "Trending",
        closesAt: in24Hours
      },
      {
        question: "Will 'Buy the dip' trend globally on Twitter today?",
        description: "Classic FOMO response to market crashes.",
        category: "Trending",
        closesAt: in24Hours
      },

      // Meta FOMO Markets
      {
        question: "Will this FOMO market get 100+ bets in 1 hour?",
        description: "Meta FOMO - betting on the FOMO of betting on FOMO.",
        category: "Meta",
        closesAt: in60Minutes
      },
      {
        question: "Will 'FOMO' be searched 10K+ times on Google today?",
        description: "When people start googling FOMO, peak FOMO is near.",
        category: "Trending",
        closesAt: in24Hours
      },
      {
        question: "Will someone claim they 'called the top' after every 5% dip today?",
        description: "Hindsight FOMO - everyone's a trading genius after the fact.",
        category: "Hype",
        closesAt: in24Hours
      }
    ]

    console.log('Clearing existing FOMO markets...')
    await prisma.fomoMarket.deleteMany()
    
    console.log('Creating new FOMO markets...')
    for (const marketData of fomoSpecialMarkets) {
      const { yesPool, noPool } = getRandomInitialPools()
      
      await prisma.fomoMarket.create({
        data: {
          id: createMarketId(marketData.question, marketData.category),
          question: marketData.question,
          description: marketData.description,
          category: marketData.category,
          image: getMarketImage(marketData.category),
          slug: createSlug(marketData.question),
          status: 'OPEN',
          yesPool,
          noPool,
          totalVolume: yesPool + noPool,
          participants: Math.floor(Math.random() * 50) + 10,
          trending: Math.random() > 0.7,
          createdAt: now,
          closesAt: marketData.closesAt,
          createdBy: 'fomo-system'
        }
      })
      
      console.log(`🔥 Created FOMO market: ${marketData.question}`)
    }

    console.log(`✅ Created ${fomoSpecialMarkets.length} FOMO markets`)
    
  } catch (error) {
    console.error('❌ FOMO market population error:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  populateFomoMarkets()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}