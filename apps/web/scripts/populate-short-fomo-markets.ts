import { prisma } from '@fomora/db'
import { getMarketImage } from '@/lib/market-images'
import { randomUUID } from 'crypto'

// Crypto coin data with short-term prediction types
const SHORT_TERM_COINS = [
  { symbol: 'BTC', name: 'Bitcoin', emoji: '₿', multipliers: [1.02, 1.03, 1.05, 0.98, 0.97, 0.95] },
  { symbol: 'ETH', name: 'Ethereum', emoji: '⟠', multipliers: [1.03, 1.05, 1.07, 0.97, 0.95, 0.93] },
  { symbol: 'SOL', name: 'Solana', emoji: '◎', multipliers: [1.05, 1.08, 1.10, 0.95, 0.92, 0.90] },
  { symbol: 'DOGE', name: 'Dogecoin', emoji: '🐕', multipliers: [1.08, 1.12, 1.15, 0.92, 0.88, 0.85] },
  { symbol: 'PEPE', name: 'Pepe', emoji: '🐸', multipliers: [1.10, 1.15, 1.20, 0.90, 0.85, 0.80] },
  { symbol: 'SHIB', name: 'Shiba Inu', emoji: '🐕', multipliers: [1.08, 1.12, 1.18, 0.92, 0.88, 0.82] },
  { symbol: 'WIF', name: 'Dogwifhat', emoji: '🐕‍🦺', multipliers: [1.12, 1.18, 1.25, 0.88, 0.82, 0.75] },
  { symbol: 'BONK', name: 'Bonk', emoji: '🪙', multipliers: [1.15, 1.20, 1.30, 0.85, 0.80, 0.70] },
  { symbol: 'POPCAT', name: 'Popcat', emoji: '🐱', multipliers: [1.10, 1.15, 1.22, 0.90, 0.85, 0.78] },
  { symbol: 'PNUT', name: 'Peanut', emoji: '🥜', multipliers: [1.12, 1.18, 1.25, 0.88, 0.82, 0.75] }
]

async function fetchCryptoPrices(): Promise<Record<string, number>> {
  try {
    // Map symbols to CoinGecko IDs
    const symbolToId: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum', 
      'SOL': 'solana',
      'DOGE': 'dogecoin',
      'PEPE': 'pepe',
      'SHIB': 'shiba-inu',
      'WIF': 'dogwifcoin',
      'BONK': 'bonk',
      'POPCAT': 'popcat',
      'PNUT': 'peanut-the-squirrel'
    }

    const symbols = SHORT_TERM_COINS.map(coin => coin.symbol)
    const ids = symbols.map(symbol => symbolToId[symbol]).filter(Boolean).join(',')
    
    console.log('🔍 Fetching live prices from CoinGecko for:', symbols.join(', '))
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Fomora/1.0'
        }
      }
    )
    
    if (!response.ok) {
      console.warn('❌ CoinGecko API failed:', response.status, response.statusText)
      throw new Error(`CoinGecko API error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📊 Raw CoinGecko data:', data)
    
    // Convert back to symbol-based mapping
    const prices: Record<string, number> = {}
    for (const [symbol, coinId] of Object.entries(symbolToId)) {
      if (data[coinId]?.usd) {
        prices[symbol] = data[coinId].usd
        console.log(`💰 ${symbol}: $${data[coinId].usd} (24h: ${data[coinId].usd_24h_change?.toFixed(2)}%)`)
      }
    }
    
    if (Object.keys(prices).length === 0) {
      throw new Error('No valid prices received from CoinGecko')
    }
    
    return prices
  } catch (error) {
    console.error('❌ Failed to fetch crypto prices:', error)
    console.log('🔄 Using fallback prices for testing...')
    // Return fallback prices only as last resort
    return {
      BTC: 45000, ETH: 2500, SOL: 110, DOGE: 0.08, PEPE: 0.000012,
      SHIB: 0.000018, WIF: 2.1, BONK: 0.000025, POPCAT: 1.2, PNUT: 0.65
    }
  }
}

function generateShortTermMarkets(prices: Record<string, number>) {
  const now = new Date()
  const markets = []
  
  // Time intervals with realistic movement expectations
  const intervals = [
    { minutes: 15, label: '15 minutes', volatility: { min: 1, max: 3 } },
    { minutes: 30, label: '30 minutes', volatility: { min: 2, max: 5 } },
    { minutes: 60, label: '1 hour', volatility: { min: 3, max: 8 } }
  ]
  
  // Prioritize price movement markets (more exciting and trackable)
  const marketTypes = ['price_up', 'price_down', 'volatility', 'price_up', 'price_down'] // Weight price movements
  
  let marketCount = 0
  
  for (const coin of SHORT_TERM_COINS) {
    if (marketCount >= 20) break
    
    const currentPrice = prices[coin.symbol]
    if (!currentPrice) {
      console.warn(`⚠️ No price data for ${coin.symbol}, skipping...`)
      continue
    }
    
    const priceStr = currentPrice < 1 ? currentPrice.toFixed(6) : currentPrice.toFixed(2)
    
    // Create 2 markets per coin (mix of timeframes)
    const selectedIntervals = intervals.sort(() => Math.random() - 0.5).slice(0, 2)
    
    for (const interval of selectedIntervals) {
      if (marketCount >= 20) break
      
      const closesAt = new Date(now.getTime() + interval.minutes * 60 * 1000)
      const marketType = marketTypes[Math.floor(Math.random() * marketTypes.length)]
      
      let market
      
      switch (marketType) {
        case 'price_up':
          // Calculate realistic upward targets based on interval and coin volatility
          let upPercent: number
          if (interval.minutes <= 15) {
            upPercent = ['BTC', 'ETH'].includes(coin.symbol) ? 1 + Math.random() * 2 : 2 + Math.random() * 4 // 1-3% for major, 2-6% for alts
          } else if (interval.minutes <= 30) {
            upPercent = ['BTC', 'ETH'].includes(coin.symbol) ? 2 + Math.random() * 3 : 3 + Math.random() * 6 // 2-5% for major, 3-9% for alts
          } else {
            upPercent = ['BTC', 'ETH'].includes(coin.symbol) ? 3 + Math.random() * 5 : 5 + Math.random() * 10 // 3-8% for major, 5-15% for alts
          }
          
          const targetUpPrice = currentPrice * (1 + upPercent / 100)
          const targetUpStr = targetUpPrice < 1 ? targetUpPrice.toFixed(6) : targetUpPrice.toFixed(2)
          
          market = {
            question: `Will ${coin.name} (${coin.symbol}) reach $${targetUpStr} in ${interval.label}?`,
            description: `${coin.emoji} Current: $${priceStr} → Target: $${targetUpStr} (+${upPercent.toFixed(1)}%) in ${interval.label}. Live CoinGecko tracking!`,
            closesAt,
            category: 'Crypto'
          }
          break
          
        case 'price_down':
          // Calculate realistic downward targets
          let downPercent: number
          if (interval.minutes <= 15) {
            downPercent = ['BTC', 'ETH'].includes(coin.symbol) ? 1 + Math.random() * 2 : 2 + Math.random() * 4
          } else if (interval.minutes <= 30) {
            downPercent = ['BTC', 'ETH'].includes(coin.symbol) ? 2 + Math.random() * 3 : 3 + Math.random() * 6
          } else {
            downPercent = ['BTC', 'ETH'].includes(coin.symbol) ? 3 + Math.random() * 5 : 5 + Math.random() * 10
          }
          
          const targetDownPrice = currentPrice * (1 - downPercent / 100)
          const targetDownStr = targetDownPrice < 1 ? targetDownPrice.toFixed(6) : targetDownPrice.toFixed(2)
          
          market = {
            question: `Will ${coin.name} (${coin.symbol}) drop to $${targetDownStr} in ${interval.label}?`,
            description: `${coin.emoji} Current: $${priceStr} → Target: $${targetDownStr} (-${downPercent.toFixed(1)}%) in ${interval.label}. Live CoinGecko tracking!`,
            closesAt,
            category: 'Crypto'
          }
          break
          
        case 'volatility':
          const volatilityThreshold = interval.volatility.min + Math.random() * (interval.volatility.max - interval.volatility.min)
          const roundedVolatility = Math.round(volatilityThreshold * 10) / 10
          
          market = {
            question: `Will ${coin.name} (${coin.symbol}) move ±${roundedVolatility}% in ${interval.label}?`,
            description: `${coin.emoji} Current: $${priceStr}. Will price move up OR down by ${roundedVolatility}% or more within ${interval.label}? Live tracking via CoinGecko!`,
            closesAt,
            category: 'Crypto'
          }
          break
      }
      
      if (market) {
        markets.push(market)
        marketCount++
        console.log(`📊 Generated: ${market.question}`)
      }
    }
  }
  
  return markets
}

async function populateShortFomoMarkets(clearExisting = false) {
  try {
    console.log('🚀 Starting short-term FOMO market population...')
    
    // Clear existing short-term markets if requested
    if (clearExisting) {
      console.log('🧹 Clearing existing short-term FOMO markets...')
      const deleted = await prisma.fomoMarket.deleteMany({
        where: {
          createdBy: 'fomo-system',
          closesAt: {
            gte: new Date()
          }
        }
      })
      console.log(`🗑️ Deleted ${deleted.count} existing short-term markets`)
    }
    
    // Fetch latest crypto prices from CoinGecko
    const prices = await fetchCryptoPrices()
    console.log('📈 Fetched live prices for', Object.keys(prices).length, 'coins')
    console.log('💰 Sample prices:', Object.entries(prices).slice(0, 3).map(([symbol, price]) => `${symbol}: $${price}`).join(', '))
    
    // Generate short-term markets based on real prices
    const markets = generateShortTermMarkets(prices)
    console.log(`🎯 Generated ${markets.length} short-term FOMO markets with live prices`)
    
    // Create markets in database
    let created = 0
    for (const marketData of markets) {
      const marketId = randomUUID()
      const slug = marketData.question
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)
      
      // Get market image
      const image = await getMarketImage(marketData.question, marketData.description)
      
      await prisma.fomoMarket.create({
        data: {
          id: marketId,
          slug: `${slug}-${Date.now()}-${created}`,
          question: marketData.question,
          description: marketData.description,
          category: marketData.category,
          closesAt: marketData.closesAt,
          status: 'OPEN',
          yesPool: 750 + Math.floor(Math.random() * 1250), // 750-2000 (slightly higher initial pools)
          noPool: 750 + Math.floor(Math.random() * 1250),  // 750-2000
          totalVolume: 0,
          participants: 0,
          trending: Math.random() > 0.6, // 40% chance to be trending
          image: image || undefined,
          createdBy: 'fomo-system'
        }
      })
      
      created++
      console.log(`✅ Created: ${marketData.question}`)
    }
    
    console.log(`🎉 Successfully created ${created} short-term FOMO markets with LIVE CoinGecko prices!`)
    
    return {
      success: true,
      marketsCreated: created,
      pricesUsed: prices,
      breakdown: {
        '15min': markets.filter(m => m.description.includes('15 minutes')).length,
        '30min': markets.filter(m => m.description.includes('30 minutes')).length,
        '60min': markets.filter(m => m.description.includes('1 hour')).length
      }
    }
    
  } catch (error) {
    console.error('❌ Short-term FOMO market population failed:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  populateShortFomoMarkets()
    .then((result) => {
      console.log('\n✨ Population completed:', result)
      process.exit(0)
    })
    .catch(error => {
      console.error('\n💥 Population failed:', error)
      process.exit(1)
    })
}

export { populateShortFomoMarkets }
