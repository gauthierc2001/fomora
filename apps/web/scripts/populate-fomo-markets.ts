import { fomoMarkets } from '@/lib/storage'
import { createHash } from 'crypto'

function createMarketId(question: string, category: string, suffix?: string): string {
  // Use the same format as regular markets for compatibility
  const normalizedQuestion = question
    .replace(/\$[\d,]+\.?\d*/g, '$PRICE') // Replace any price with $PRICE
    .replace(/[\d,]+\.?\d*%/g, 'X%') // Replace percentages with X%
    .replace(/\s+/g, ' ') // Normalize whitespace
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

function getMarketImage(category: string, question: string, symbol?: string): string {
  // Use a more reliable placeholder service
  const baseUrl = 'https://placehold.co/400x300'
  const categoryColors = {
    'FOMO': 'FF6B6B',
    'Hype': 'FF9F43', 
    'Viral': '6C5CE7',
    'Trending': '00B894',
    'Buzz': 'FDCB6E',
    'Meta': 'A855F7'
  }
  
  const color = categoryColors[category as keyof typeof categoryColors] || 'A0A0A0'
  // Use simple text that's URL-safe
  const text = encodeURIComponent(`FOMO ${category}`)
  
  return `${baseUrl}/${color}/FFFFFF?text=${text}`
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
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    // FOMO-specific markets focused on hype, virality, and trending topics
    const fomoSpecialMarkets = [
      // Viral Content & Social Media
      {
        question: "Will a TikTok video hit 10M views in the next 6 hours?",
        description: "Peak FOMO time for viral content explosion on TikTok.",
        category: "Viral",
        closesAt: in12Hours
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
        question: "Will GameStop mention NFTs in next 24 hours?",
        description: "WSB and crypto communities on high alert for announcements.",
        category: "Buzz",
        closesAt: in24Hours
      },
      {
        question: "Will Elon tweet about Dogecoin today?",
        description: "Classic FOMO trigger - Elon's crypto tweets move markets instantly.",
        category: "FOMO",
        closesAt: in24Hours
      },
      
      // Trending & Hype
      {
        question: "Will 'Diamond Hands' get 100K mentions on Reddit today?",
        description: "Peak FOMO terminology during market volatility.",
        category: "Trending",
        closesAt: in24Hours
      },
      {
        question: "Will any crypto influencer claim 'This is financial advice' today?",
        description: "Ultimate FOMO move - when influencers break their disclaimers.",
        category: "Hype",
        closesAt: in24Hours
      },
      {
        question: "Will someone buy an NFT for over $100K in next 12 hours?",
        description: "Peak NFT FOMO territory with whale purchases.",
        category: "FOMO",
        closesAt: in12Hours
      },
      {
        question: "Will 'Buy the dip' trend globally on Twitter today?",
        description: "Classic FOMO response to market crashes.",
        category: "Trending",
        closesAt: in24Hours
      },
      {
        question: "Will any stock go up 50%+ in pre-market trading?",
        description: "After-hours FOMO can create explosive pre-market moves.",
        category: "Hype",
        closesAt: in12Hours
      },

      // Quick FOMO Markets (15-60 minutes)
      {
        question: "Will Bitcoin move $1000+ in the next 15 minutes?",
        description: "Pure FOMO volatility - anything can happen in crypto.",
        category: "FOMO",
        closesAt: in15Minutes
      },
      {
        question: "Will any celebrity post about crypto in the next hour?",
        description: "Celebrity FOMO posts can trigger massive market movements.",
        category: "Buzz",
        closesAt: in60Minutes
      },
      {
        question: "Will 'To the moon' get tweeted 1000+ times in 30 minutes?",
        description: "Peak FOMO expression during explosive price action.",
        category: "Viral",
        closesAt: in30Minutes
      },
      {
        question: "Will any DEX token pump 500%+ in the next 2 hours?",
        description: "DeFi FOMO can create insane pumps on decentralized exchanges.",
        category: "Hype",
        closesAt: new Date(now.getTime() + 2 * 60 * 60 * 1000)
      },
      {
        question: "Will someone lose $1M+ on a meme coin trade today?",
        description: "Peak FOMO often leads to devastating losses.",
        category: "FOMO",
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
        question: "Will any trader claim they 'bought the top' today?",
        description: "Peak FOMO admission - the moment you realize you FOMO'd.",
        category: "Buzz", 
        closesAt: in24Hours
      },

      // More Viral/Meme FOMO
      {
        question: "Will someone post 'wen moon' 1000+ times on Reddit in 1 hour?",
        description: "Peak desperation phase of crypto FOMO.",
        category: "Viral",
        closesAt: in60Minutes
      },
      {
        question: "Will any YouTuber claim 'not financial advice' 50+ times today?",
        description: "The more disclaimers, the more FOMO content incoming.",
        category: "Buzz",
        closesAt: in24Hours
      },
      {
        question: "Will 'diamond hands' emoji break Twitter in next 2 hours?",
        description: "💎🙌 spam overload during peak FOMO moments.",
        category: "Viral",
        closesAt: new Date(now.getTime() + 2 * 60 * 60 * 1000)
      },
      {
        question: "Will someone livestream buying meme coins for 12 hours straight?",
        description: "Peak degeneracy content creation meets FOMO trading.",
        category: "Hype",
        closesAt: in12Hours
      },
      {
        question: "Will 'GM' trend higher than 'GN' on crypto Twitter today?",
        description: "Morning FOMO energy vs evening FUD vibes.",
        category: "Trending",
        closesAt: in24Hours
      },
      {
        question: "Will any influencer change their Twitter name to include 'AI' today?",
        description: "AI FOMO name changes are the new laser eyes.",
        category: "Buzz",
        closesAt: in24Hours
      },
      {
        question: "Will someone claim they 'called the top' after every 5% dip today?",
        description: "Hindsight FOMO - everyone's a trading genius after the fact.",
        category: "Hype",
        closesAt: in24Hours
      },
      {
        question: "Will 'HODL until I die' be tweeted 500+ times in 3 hours?",
        description: "Ultimate commitment FOMO during market stress.",
        category: "Viral",
        closesAt: new Date(now.getTime() + 3 * 60 * 60 * 1000)
      },
      {
        question: "Will anyone post a 100+ tweet thread about why they're not selling?",
        description: "Massive cope threads during FOMO exit liquidity moments.",
        category: "Meta",
        closesAt: in12Hours
      },
      {
        question: "Will 'buy signal' be mentioned 10,000+ times on Discord today?",
        description: "Peak FOMO coordination in private trading groups.",
        category: "Buzz",
        closesAt: in24Hours
      },
      {
        question: "Will someone claim their cat predicted the market move today?",
        description: "Peak animal oracle FOMO - even pets become analysts.",
        category: "Meta",
        closesAt: in24Hours
      },
      {
        question: "Will 'number go up' technology trend globally in 30 minutes?",
        description: "Classic crypto FOMO meme reaching normie territory.",
        category: "Viral",
        closesAt: in30Minutes
      },
      {
        question: "Will anyone rage-delete their trading app today?",
        description: "Peak emotional FOMO reaction to market movements.",
        category: "Hype",
        closesAt: in24Hours
      },
      {
        question: "Will 'this time is different' be said unironically 100+ times today?",
        description: "Famous last words of peak FOMO cycles.",
        category: "Buzz",
        closesAt: in24Hours
      },
      {
        question: "Will someone tattoo a meme coin logo today?",
        description: "Permanent FOMO commitment - the ultimate diamond hands.",
        category: "Meta",
        closesAt: in24Hours
      },
      {
        question: "Will 'I'm never selling' age like milk within 6 hours?",
        description: "Paper hands reality check incoming for FOMO declarations.",
        category: "Hype",
        closesAt: new Date(now.getTime() + 6 * 60 * 60 * 1000)
      },
      {
        question: "Will someone livestream eating ramen 'until moon' today?",
        description: "Peak FOMO sacrifice content - trading food for hopium.",
        category: "Viral",
        closesAt: in24Hours
      }
    ]

    let marketsCreated = 0
    
    for (const marketData of fomoSpecialMarkets) {
      const { yesPool, noPool } = getRandomInitialPools()
      const market = {
        id: createMarketId(marketData.question, marketData.category),
        question: marketData.question,
        description: marketData.description,
        category: marketData.category,
        image: getMarketImage(marketData.category, marketData.question),
        slug: createSlug(marketData.question),
        status: 'OPEN' as const,
        yesPool,
        noPool,
        createdAt: now,
        closesAt: marketData.closesAt,
        createdBy: 'fomo-system'
      }

      fomoMarkets.set(market.id, market)
      marketsCreated++
      
      console.log(`🔥 Created FOMO market: ${market.question}`)
    }

    console.log(`✅ Created ${marketsCreated} FOMO markets`)
    return marketsCreated
    
  } catch (error) {
    console.error('❌ FOMO market population error:', error)
    throw error
  }
}
