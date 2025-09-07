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

interface CoinData {
  price: number
  change24h: number
  logo: string
}

async function fetchCryptoPrices(): Promise<Record<string, CoinData>> {
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
    
    console.log('🔍 Fetching live prices + logos from CoinGecko for:', symbols.join(', '))
    
    // Fetch both price data and coin details (for logos)
    const [priceResponse, coinsResponse] = await Promise.all([
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Fomora/1.0'
          }
        }
      ),
      fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=50&page=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Fomora/1.0'
          }
        }
      )
    ])
    
    if (!priceResponse.ok || !coinsResponse.ok) {
      console.warn('❌ CoinGecko API failed:', priceResponse.status, coinsResponse.status)
      throw new Error(`CoinGecko API error: ${priceResponse.status} / ${coinsResponse.status}`)
    }
    
    const priceData = await priceResponse.json()
    const coinsData = await coinsResponse.json()
    
    console.log('📊 Raw CoinGecko price data:', priceData)
    console.log('🖼️ Raw CoinGecko coins data:', coinsData.length, 'coins with logos')
    
    // Create a mapping of coin ID to logo
    const logoMap: Record<string, string> = {}
    for (const coin of coinsData) {
      logoMap[coin.id] = coin.image
    }
    
    // Convert back to symbol-based mapping with prices and logos
    const coinData: Record<string, CoinData> = {}
    for (const [symbol, coinId] of Object.entries(symbolToId)) {
      if (priceData[coinId]?.usd) {
        coinData[symbol] = {
          price: priceData[coinId].usd,
          change24h: priceData[coinId].usd_24h_change || 0,
          logo: logoMap[coinId] || ''
        }
        console.log(`💰 ${symbol}: $${coinData[symbol].price} (24h: ${coinData[symbol].change24h.toFixed(2)}%) 🖼️ ${coinData[symbol].logo ? '✅' : '❌'}`)
      }
    }
    
    if (Object.keys(coinData).length === 0) {
      throw new Error('No valid coin data received from CoinGecko')
    }
    
    return coinData
  } catch (error) {
    console.error('❌ Failed to fetch crypto data:', error)
    console.log('🔄 Using fallback data for testing...')
    // Return fallback data only as last resort
    const fallbackData: Record<string, CoinData> = {}
    const fallbackPrices = {
      BTC: 45000, ETH: 2500, SOL: 110, DOGE: 0.08, PEPE: 0.000012,
      SHIB: 0.000018, WIF: 2.1, BONK: 0.000025, POPCAT: 1.2, PNUT: 0.65
    }
    
    for (const [symbol, price] of Object.entries(fallbackPrices)) {
      fallbackData[symbol] = { price, change24h: 0, logo: '' }
    }
    
    return fallbackData
  }
}

function generateShortTermMarkets(coinData: Record<string, CoinData>) {
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
    
    const coinInfo = coinData[coin.symbol]
    if (!coinInfo) {
      console.warn(`⚠️ No coin data for ${coin.symbol}, skipping...`)
      continue
    }
    
    const currentPrice = coinInfo.price
    const change24h = coinInfo.change24h
    const logo = coinInfo.logo
    const priceStr = currentPrice < 1 ? currentPrice.toFixed(6) : currentPrice.toFixed(2)
    
    console.log(`🔍 Processing ${coin.symbol}: $${priceStr} (24h: ${change24h.toFixed(2)}%) Logo: ${logo ? '✅' : '❌'}`)
    
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
            category: 'Crypto',
            logo
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
            category: 'Crypto',
            logo
          }
          break
          
        case 'volatility':
          const volatilityThreshold = interval.volatility.min + Math.random() * (interval.volatility.max - interval.volatility.min)
          const roundedVolatility = Math.round(volatilityThreshold * 10) / 10
          
          market = {
            question: `Will ${coin.name} (${coin.symbol}) move ±${roundedVolatility}% in ${interval.label}?`,
            description: `${coin.emoji} Current: $${priceStr}. Will price move up OR down by ${roundedVolatility}% or more within ${interval.label}? Live tracking via CoinGecko!`,
            closesAt,
            category: 'Crypto',
            logo
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

export async function populateShortFomoMarkets(clearExisting = false) {
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
    
    // Fetch latest crypto data from CoinGecko (prices + logos)
    const coinData = await fetchCryptoPrices()
    console.log('📈 Fetched live data for', Object.keys(coinData).length, 'coins')
    console.log('💰 Sample data:', Object.entries(coinData).slice(0, 3).map(([symbol, data]) => `${symbol}: $${data.price} ${data.logo ? '🖼️' : ''}`).join(', '))
    
    // Generate short-term markets based on real data
    const markets = generateShortTermMarkets(coinData)
    console.log(`🎯 Generated ${markets.length} short-term FOMO markets with live prices & logos`)
    
    // Create markets in database
    let created = 0
    for (const marketData of markets) {
      const marketId = randomUUID()
      const slug = marketData.question
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)
      
      // Use CoinGecko logo if available, otherwise fallback to generated image
      const image = marketData.logo || await getMarketImage(marketData.question, marketData.description)
      
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
      coinsWithLogos: Object.values(coinData).filter(coin => coin.logo).length,
      coinData,
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
