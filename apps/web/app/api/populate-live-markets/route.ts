import { NextRequest, NextResponse } from 'next/server'
import { markets, fomoMarkets } from '@/lib/storage'
import { createHash } from 'crypto'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Create deterministic market ID
function createMarketId(question: string, category: string, coinSymbol?: string): string {
  if (coinSymbol && category === 'Memes') {
    return `market_meme_${coinSymbol.toLowerCase()}_${Date.now()}`
  }
  
  const normalizedQuestion = question
    .replace(/\$[\d,]+\.?\d*/g, '$PRICE')
    .replace(/[\d,]+\.?\d*%/g, 'X%')
    .replace(/\s+/g, ' ')
    .trim()
  
  const hash = createHash('sha256').update(normalizedQuestion + category + Date.now()).digest('hex').slice(0, 12)
  return `market_${category.toLowerCase().replace(/\s+/g, '_')}_${hash}`
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 60)
}

function getRandomInitialPools() {
  const total = Math.floor(Math.random() * 8000) + 2000 // 2k-10k total
  const yesRatio = 0.25 + Math.random() * 0.5 // 25-75% yes
  return {
    yesPool: Math.floor(total * yesRatio),
    noPool: Math.floor(total * (1 - yesRatio))
  }
}

// Helper function to format price
function formatPrice(price: number): string {
  if (price < 0.000001) return price.toFixed(8)
  if (price < 0.0001) return price.toFixed(6)
  if (price < 0.01) return price.toFixed(4)
  if (price < 1) return price.toFixed(3)
  if (price < 100) return price.toFixed(2)
  return Math.round(price).toLocaleString()
}

// Generate price targets based on current price and volatility
function generatePriceTargets(crypto: any) {
  const currentPrice = crypto.current_price
  const change24h = crypto.price_change_percentage_24h || 0
  const volatility = Math.abs(change24h)
  
  const baseMultiplier = 0.05 + (volatility / 100) * 0.02
  
  return {
    bullish: currentPrice * (1 + baseMultiplier + 0.03), // +8-10%
    bearish: currentPrice * (1 - baseMultiplier - 0.02), // -7-9%
    moonshot: currentPrice * (1 + baseMultiplier * 3), // +15-20%
    crash: currentPrice * (1 - baseMultiplier * 2) // -10-14%
  }
}

async function getCryptoData() {
  try {
    console.log('🪙 Fetching live crypto data for market creation...')
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h,7d,30d')
    if (!response.ok) throw new Error('Failed to fetch crypto data')
    const data = await response.json()
    console.log(`📊 Fetched ${data.length} cryptocurrencies`)
    return data
  } catch (error) {
    console.error('Error fetching crypto data, using fallback:', error)
    return [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 97000, price_change_percentage_24h: 2.1, market_cap_rank: 1, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
      { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3650, price_change_percentage_24h: 1.8, market_cap_rank: 2, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
      { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 245, price_change_percentage_24h: 5.2, market_cap_rank: 4, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
      { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.42, price_change_percentage_24h: 8.1, market_cap_rank: 6, image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' },
      { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu', current_price: 0.000028, price_change_percentage_24h: 12.4, market_cap_rank: 12, image: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png' },
      { id: 'pepe', symbol: 'pepe', name: 'Pepe', current_price: 0.000021, price_change_percentage_24h: 15.7, market_cap_rank: 18, image: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg' }
    ]
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting live crypto market population...')
    
    const cryptoData = await getCryptoData()
    const now = new Date()
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000)
    const in6Hours = new Date(now.getTime() + 6 * 60 * 60 * 1000)
    const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000)
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000)
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    let marketsCreated = 0
    let fomoMarketsCreated = 0

    // Clear existing markets first
    await markets.clear()
    await fomoMarkets.clear()

    // Create crypto-specific markets with live prices
    console.log('📈 Creating crypto markets with live prices...')
    
    // Top cryptocurrencies for main markets
    const topCryptos = cryptoData.slice(0, 8)
    
    for (const crypto of topCryptos) {
      const currentPrice = crypto.current_price
      const priceTargets = generatePriceTargets(crypto)
      const change24h = crypto.price_change_percentage_24h || 0
      
      // Create different types of markets for each crypto
      const marketTypes = [
        {
          question: `Will ${crypto.name} (${crypto.symbol.toUpperCase()}) reach $${formatPrice(priceTargets.bullish)} in the next 24 hours?`,
          description: `${crypto.name} is currently trading at $${formatPrice(currentPrice)} (24h: ${change24h.toFixed(2)}%). This target represents a ${((priceTargets.bullish/currentPrice - 1) * 100).toFixed(1)}% increase from current levels.`,
          category: 'Crypto',
          closesAt: in24Hours,
          image: crypto.image
        },
        {
          question: `Will ${crypto.name} drop below $${formatPrice(priceTargets.bearish)} this week?`,
          description: `Current price: $${formatPrice(currentPrice)}. Market volatility could push ${crypto.symbol.toUpperCase()} down ${((1 - priceTargets.bearish/currentPrice) * 100).toFixed(1)}% to this support level.`,
          category: 'Crypto',
          closesAt: in7Days,
          image: crypto.image
        }
      ]

      // Pick one market type for this crypto
      const selectedMarket = marketTypes[Math.floor(Math.random() * marketTypes.length)]
      const { yesPool, noPool } = getRandomInitialPools()
      
      const market = {
        id: createMarketId(selectedMarket.question, selectedMarket.category, crypto.symbol),
        question: selectedMarket.question,
        description: selectedMarket.description,
        category: selectedMarket.category,
        image: selectedMarket.image,
        status: 'OPEN' as const,
        yesPool,
        noPool,
        createdAt: now,
        closesAt: selectedMarket.closesAt,
        createdBy: 'system_user_001',
        slug: createSlug(selectedMarket.question)
      }

      await markets.set(market.id, market)
      marketsCreated++
      console.log(`✅ Created crypto market: ${market.question}`)
    }

    // Create meme coin markets
    console.log('🐕 Creating meme coin markets...')
    const memeCoins = cryptoData.filter(crypto => 
      ['doge', 'shib', 'pepe', 'bonk', 'floki', 'wif'].includes(crypto.symbol)
    ).slice(0, 4)

    for (const memeCoin of memeCoins) {
      const currentPrice = memeCoin.current_price
      const priceTargets = generatePriceTargets(memeCoin)
      const change24h = memeCoin.price_change_percentage_24h || 0

      const questionText = `Will ${memeCoin.name} (${memeCoin.symbol.toUpperCase()}) pump ${((priceTargets.moonshot/currentPrice - 1) * 100).toFixed(0)}%+ this week?`
      
      const { yesPool, noPool } = getRandomInitialPools()
      const market = {
        id: createMarketId(questionText, 'Memes', memeCoin.symbol),
        question: questionText,
        description: `${memeCoin.symbol.toUpperCase()} currently at $${formatPrice(currentPrice)} (24h: ${change24h.toFixed(2)}%). Meme coin moonshot prediction - can it reach $${formatPrice(priceTargets.moonshot)}?`,
        category: 'Memes',
        image: memeCoin.image,
        status: 'OPEN' as const,
        yesPool,
        noPool,
        createdAt: now,
        closesAt: in7Days,
        createdBy: 'system_user_001',
        slug: createSlug(questionText)
      }

      await markets.set(market.id, market)
      marketsCreated++
      console.log(`🚀 Created meme market: ${market.question}`)
    }

    // Create trending/social markets
    console.log('📱 Creating trending & social markets...')
    const trendingMarkets = [
      {
        question: "Will Bitcoin break its all-time high this month?",
        description: "BTC is approaching historical resistance levels. Can it break through and set new records?",
        category: "Crypto",
        closesAt: in7Days,
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
      },
      {
        question: "Will Elon Musk tweet about Dogecoin this week?",
        description: "Elon's crypto tweets historically move markets. Will he mention DOGE in the next 7 days?",
        category: "Social Media",
        closesAt: in7Days,
        image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png"
      },
      {
        question: "Will any meme coin pump 100%+ in the next 48 hours?",
        description: "Meme coin season is unpredictable. Will we see another explosive pump in the next 2 days?",
        category: "Memes",
        closesAt: in48Hours,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
      },
      {
        question: "Will Ethereum gas fees spike above 100 gwei this week?",
        description: "Network congestion can cause gas fee spikes. Will ETH fees reach extreme levels?",
        category: "Technical",
        closesAt: in7Days,
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
      }
    ]

    for (const marketData of trendingMarkets) {
      const { yesPool, noPool } = getRandomInitialPools()
      const market = {
        id: createMarketId(marketData.question, marketData.category),
        question: marketData.question,
        description: marketData.description,
        category: marketData.category,
        image: marketData.image,
        status: 'OPEN' as const,
        yesPool,
        noPool,
        createdAt: now,
        closesAt: marketData.closesAt,
        createdBy: 'system_user_001',
        slug: createSlug(marketData.question)
      }

      await markets.set(market.id, market)
      marketsCreated++
      console.log(`📊 Created trending market: ${market.question}`)
    }

    // Create FOMO markets (short-term, high-energy)
    console.log('🔥 Creating FOMO markets...')
    const fomoMarketData = [
      {
        question: "Will Bitcoin move $2000+ in the next hour?",
        description: "Extreme volatility alert! BTC showing signs of major price movement.",
        category: "FOMO",
        closesAt: in1Hour,
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
      },
      {
        question: "Will any crypto influencer claim 'this is financial advice' today?",
        description: "Peak FOMO move - when influencers break their disclaimers.",
        category: "Buzz",
        closesAt: in24Hours,
        image: "https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400&h=300&fit=crop"
      },
      {
        question: "Will 'WAGMI' trend on crypto Twitter in the next 6 hours?",
        description: "We're All Gonna Make It - classic crypto FOMO expression during pumps.",
        category: "Viral",
        closesAt: in6Hours,
        image: "https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400&h=300&fit=crop"
      },
      {
        question: "Will someone buy an NFT for over $50K in the next 12 hours?",
        description: "NFT FOMO is back? Whale purchases indicate renewed interest.",
        category: "FOMO",
        closesAt: in12Hours,
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop"
      },
      {
        question: "Will 'diamond hands' emoji usage spike 200%+ today?",
        description: "💎🙌 Social sentiment tracking during volatile market conditions.",
        category: "Viral",
        closesAt: in24Hours,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
      }
    ]

    for (const fomoData of fomoMarketData) {
      const { yesPool, noPool } = getRandomInitialPools()
      const fomoMarket = {
        id: createMarketId(fomoData.question, fomoData.category, 'fomo'),
        question: fomoData.question,
        description: fomoData.description,
        category: fomoData.category,
        image: fomoData.image,
        status: 'OPEN',
        createdAt: now,
        closesAt: fomoData.closesAt,
        yesPool,
        noPool,
        totalVolume: yesPool + noPool,
        participants: Math.floor(Math.random() * 50) + 10,
        trending: Math.random() > 0.5,
        slug: createSlug(fomoData.question),
        createdBy: 'fomo_system_001'
      }

      await fomoMarkets.set(fomoMarket.id, fomoMarket)
      fomoMarketsCreated++
      console.log(`🔥 Created FOMO market: ${fomoMarket.question}`)
    }

    console.log(`\n✅ Market population complete!`)
    console.log(`📊 Created ${marketsCreated} regular markets`)
    console.log(`🔥 Created ${fomoMarketsCreated} FOMO markets`)
    console.log(`💰 All markets use live crypto prices from CoinGecko`)

    return NextResponse.json({
      success: true,
      marketsCreated,
      fomoMarketsCreated,
      totalMarkets: marketsCreated + fomoMarketsCreated,
      cryptoDataSource: 'CoinGecko API',
      timestamp: now.toISOString()
    })

  } catch (error) {
    console.error('❌ Error populating live markets:', error)
    return NextResponse.json(
      { 
        error: 'Failed to populate markets with live data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
