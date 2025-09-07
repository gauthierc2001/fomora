import { prisma } from '@fomora/db'
import { createHash } from 'crypto'

// Create deterministic market ID
function createMarketId(question: string, category: string, coinSymbol?: string): string {
  // For meme coin markets, use symbol for consistency
  if (coinSymbol && category === 'Memes') {
    return `market_meme_${coinSymbol.toLowerCase()}_pump`
  }
  
  // For other markets, use normalized question
  const normalizedQuestion = question
    .replace(/\$[\d,]+\.?\d*/g, '$PRICE') // Replace any price with $PRICE
    .replace(/[\d,]+\.?\d*%/g, 'X%') // Replace percentages with X%
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
  
  const hash = createHash('sha256').update(normalizedQuestion + category).digest('hex').slice(0, 12)
  return `market_${category.toLowerCase().replace(/\s+/g, '_')}_${hash}`
}

// Function to get crypto data from CoinGecko
async function getCryptoData() {
  try {
    console.log('Fetching live crypto data from CoinGecko...')
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h,7d,30d')
    if (!response.ok) throw new Error('Failed to fetch crypto data')
    const data = await response.json()
    console.log(`Fetched data for ${data.length} cryptocurrencies`)
    return data
  } catch (error) {
    console.error('Error fetching crypto data, using fallback:', error)
    // Fallback data with approximate current prices (September 2024)
    return [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 65000, price_change_percentage_24h: 2.5, market_cap_rank: 1 },
      { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3500, price_change_percentage_24h: 1.8, market_cap_rank: 2 },
      { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 140, price_change_percentage_24h: 3.2, market_cap_rank: 5 },
      { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.12, price_change_percentage_24h: 5.1, market_cap_rank: 8 },
      { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu', current_price: 0.000018, price_change_percentage_24h: 7.3, market_cap_rank: 15 },
      { id: 'pepe', symbol: 'pepe', name: 'Pepe', current_price: 0.0000085, price_change_percentage_24h: 12.4, market_cap_rank: 25 }
    ]
  }
}

// Helper function to format price based on the value
function formatPrice(price: number): string {
  if (price < 0.000001) {
    return price.toFixed(8)
  } else if (price < 0.0001) {
    return price.toFixed(6)
  } else if (price < 0.01) {
    return price.toFixed(4)
  } else if (price < 1) {
    return price.toFixed(3)
  } else if (price < 100) {
    return price.toFixed(2)
  } else {
    return Math.round(price).toLocaleString()
  }
}

// Generate realistic price targets based on current price and volatility
function generatePriceTargets(crypto: any) {
  const currentPrice = crypto.current_price
  const change24h = crypto.price_change_percentage_24h || 0
  const volatility = Math.abs(change24h)
  
  // Base multipliers on recent volatility
  const baseMultiplier = 0.05 + (volatility / 100) * 0.02 // 5-7% base change
  
  return {
    bullish: currentPrice * (1 + baseMultiplier + 0.02), // +7-9%
    bearish: currentPrice * (1 - baseMultiplier - 0.01), // -6-8%
    conservative: currentPrice * (1 + baseMultiplier * 0.5), // +2.5-3.5%
    aggressive: currentPrice * (1 + baseMultiplier * 2), // +10-14%
  }
}

// Get appropriate image for market type
function getMarketImage(category: string, question: string, coinSymbol?: string): string {
  const questionLower = question.toLowerCase()
  
  // First check for specific coin mentions in question
  if (questionLower.includes('bitcoin') || questionLower.includes('btc')) {
    return 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
  }
  if (questionLower.includes('ethereum') || questionLower.includes('eth')) {
    return 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
  }
  if (questionLower.includes('solana') || questionLower.includes('sol')) {
    return 'https://assets.coingecko.com/coins/images/4128/large/solana.png'
  }
  if (questionLower.includes('dogecoin') || questionLower.includes('doge')) {
    return 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png'
  }
  if (questionLower.includes('shiba') || questionLower.includes('shib')) {
    return 'https://assets.coingecko.com/coins/images/11939/large/shiba.png'
  }
  if (questionLower.includes('pepe')) {
    return 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg'
  }
  
  // Check for specific coin symbols
  if (coinSymbol) {
    const coinImages: Record<string, string> = {
      'btc': 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      'eth': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      'sol': 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      'doge': 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
      'shib': 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
      'pepe': 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
      'bonk': 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg',
      'wif': 'https://assets.coingecko.com/coins/images/35087/large/dogwifcoin.jpg',
      'floki': 'https://assets.coingecko.com/coins/images/16746/large/floki.png'
    }
    if (coinImages[coinSymbol]) return coinImages[coinSymbol]
  }

  // Fallback by category
  const categoryImages: Record<string, string> = {
    'Memes': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    'Social Media': 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400&h=300&fit=crop',
    'Crypto': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop',
    'Trading': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop',
    'Technical': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    'Security': 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
    'Finance': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'
  }
  
  return categoryImages[category] || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop'
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function getRandomInitialPools() {
  const total = Math.floor(Math.random() * 5000) + 1000 // 1000-6000 total
  const yesRatio = Math.random() * 0.6 + 0.2 // 20% to 80%
  return {
    yesPool: Math.floor(total * yesRatio),
    noPool: Math.floor(total * (1 - yesRatio))
  }
}

export async function populateCryptoMarkets() {
  try {
    console.log('🚀 Starting crypto market population...')
    const cryptoData = await getCryptoData()
    console.log(`📊 Fetched ${cryptoData.length} cryptocurrencies`)
    const now = new Date()
    const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000)
    const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000)
    const in60Minutes = new Date(now.getTime() + 60 * 60 * 1000)
    const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000)
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    // Add meme coin markets with real prices first
    let marketsCreated = 0
    const targetMarkets = 20

    console.log('Creating meme coin markets with live prices...')
    const memeCoins = cryptoData.filter(crypto => 
      ['doge', 'shib', 'pepe', 'bonk', 'floki', 'wif', 'brett', 'popcat'].includes(crypto.symbol)
    ).slice(0, 4)

    for (const memeCoin of memeCoins) {
      if (marketsCreated >= targetMarkets) break

      const currentPrice = memeCoin.current_price
      const priceTargets = generatePriceTargets(memeCoin)
      const change24h = memeCoin.price_change_percentage_24h || 0

      const questionText = `Will ${memeCoin.name} pump above $${formatPrice(priceTargets.aggressive)} in 24 hours?`
      
      const memeMarket = {
        question: questionText,
        description: `${memeCoin.symbol.toUpperCase()} currently at $${formatPrice(currentPrice)} (24h: ${change24h.toFixed(2)}%). Meme coin moonshot prediction - target is ${((priceTargets.aggressive/currentPrice - 1) * 100).toFixed(1)}% pump!`,
        category: 'Memes',
        closesAt: in48Hours,
        image: getMarketImage('Memes', questionText, memeCoin.symbol)
      }

      const { yesPool, noPool } = getRandomInitialPools()
      const marketId = createMarketId(memeMarket.question, memeMarket.category, memeCoin.symbol)

      try {
        await prisma.market.create({
          data: {
            id: marketId,
            question: memeMarket.question,
            description: memeMarket.description,
            category: memeMarket.category,
            image: memeMarket.image,
            status: 'OPEN',
            yesPool,
            noPool,
            createdAt: now,
            closesAt: memeMarket.closesAt,
            createdBy: 'system',
            slug: createSlug(memeMarket.question)
          }
        })

        marketsCreated++
        console.log(`Created meme coin market: ${memeMarket.question}`)
        console.log(`  Market ID: ${marketId}`)
      } catch (error) {
        if (error instanceof Error && error.message.includes('prepared statement')) {
          await prisma.$disconnect()
          await prisma.$connect()
          // Retry the operation
          await prisma.market.create({
            data: {
              id: marketId,
              question: memeMarket.question,
              description: memeMarket.description,
              category: memeMarket.category,
              image: memeMarket.image,
              status: 'OPEN',
              yesPool,
              noPool,
              createdAt: now,
              closesAt: memeMarket.closesAt,
              createdBy: 'system',
              slug: createSlug(memeMarket.question)
            }
          })
          marketsCreated++
          console.log(`Created meme coin market (retry): ${memeMarket.question}`)
        } else {
          console.error(`Failed to create market: ${error}`)
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    console.log(`\n✅ Successfully created ${marketsCreated} crypto prediction markets!`)
    return marketsCreated
  } catch (error) {
    console.error('❌ Error in populateCryptoMarkets:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}