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
    const symbols = SHORT_TERM_COINS.map(coin => coin.symbol)
    const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` 
      : process.env.PORT 
        ? `http://localhost:${process.env.PORT}`
        : 'http://localhost:8000'
    
    const response = await fetch(`${baseUrl}/api/crypto-prices?symbols=${symbols.join(',')}`, {
      headers: { 'Accept': 'application/json' }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch prices')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch crypto prices:', error)
    // Return fallback prices
    return {
      BTC: 45000, ETH: 2500, SOL: 110, DOGE: 0.08, PEPE: 0.000012,
      SHIB: 0.000018, WIF: 2.1, BONK: 0.000025, POPCAT: 1.2, PNUT: 0.65
    }
  }
}

function generateShortTermMarkets(prices: Record<string, number>) {
  const now = new Date()
  const markets = []
  
  // Time intervals
  const intervals = [
    { minutes: 15, label: '15 minutes' },
    { minutes: 30, label: '30 minutes' },
    { minutes: 60, label: '1 hour' }
  ]
  
  // Market types for variety
  const marketTypes = [
    'price_up', 'price_down', 'volatility', 'volume_spike', 'social_trend', 'whale_move'
  ]
  
  let marketCount = 0
  
  for (const coin of SHORT_TERM_COINS) {
    if (marketCount >= 20) break
    
    const currentPrice = prices[coin.symbol] || 1
    const priceStr = currentPrice < 1 ? currentPrice.toFixed(6) : currentPrice.toFixed(2)
    
    // Pick 2 random intervals for this coin
    const selectedIntervals = intervals.sort(() => Math.random() - 0.5).slice(0, 2)
    
    for (const interval of selectedIntervals) {
      if (marketCount >= 20) break
      
      const closesAt = new Date(now.getTime() + interval.minutes * 60 * 1000)
      const marketType = marketTypes[Math.floor(Math.random() * marketTypes.length)]
      
      let market
      
      switch (marketType) {
        case 'price_up':
          const upMultiplier = coin.multipliers[Math.floor(Math.random() * 3)] // First 3 are up
          const targetUpPrice = (currentPrice * upMultiplier).toFixed(currentPrice < 1 ? 6 : 2)
          market = {
            question: `Will ${coin.name} (${coin.symbol}) hit $${targetUpPrice} in ${interval.label}?`,
            description: `${coin.emoji} Current: $${priceStr}. Target: $${targetUpPrice} (+${((upMultiplier - 1) * 100).toFixed(1)}%) within ${interval.label}.`,
            closesAt,
            category: 'Crypto'
          }
          break
          
        case 'price_down':
          const downMultiplier = coin.multipliers[Math.floor(Math.random() * 3) + 3] // Last 3 are down
          const targetDownPrice = (currentPrice * downMultiplier).toFixed(currentPrice < 1 ? 6 : 2)
          market = {
            question: `Will ${coin.name} (${coin.symbol}) drop to $${targetDownPrice} in ${interval.label}?`,
            description: `${coin.emoji} Current: $${priceStr}. Target: $${targetDownPrice} (${((downMultiplier - 1) * 100).toFixed(1)}%) within ${interval.label}.`,
            closesAt,
            category: 'Crypto'
          }
          break
          
        case 'volatility':
          const volatilityThreshold = interval.minutes <= 15 ? 3 : interval.minutes <= 30 ? 5 : 8
          market = {
            question: `Will ${coin.name} (${coin.symbol}) move ±${volatilityThreshold}% in ${interval.label}?`,
            description: `${coin.emoji} Current: $${priceStr}. Will price move up OR down by ${volatilityThreshold}% or more within ${interval.label}?`,
            closesAt,
            category: 'Crypto'
          }
          break
          
        case 'volume_spike':
          const volumeMultiplier = interval.minutes <= 15 ? '500K' : interval.minutes <= 30 ? '1M' : '2M'
          market = {
            question: `Will ${coin.name} (${coin.symbol}) see $${volumeMultiplier}+ volume spike in ${interval.label}?`,
            description: `${coin.emoji} Trading volume must exceed $${volumeMultiplier} in a single ${interval.label} period. Current: $${priceStr}`,
            closesAt,
            category: 'Crypto'
          }
          break
          
        case 'social_trend':
          market = {
            question: `Will ${coin.name} (${coin.symbol}) trend on crypto Twitter in ${interval.label}?`,
            description: `${coin.emoji} Will ${coin.name} appear in trending crypto discussions on Twitter within ${interval.label}? Current: $${priceStr}`,
            closesAt,
            category: 'Crypto'
          }
          break
          
        case 'whale_move':
          const whaleAmount = coin.symbol === 'BTC' ? '$10M' : coin.symbol === 'ETH' ? '$5M' : '$1M'
          market = {
            question: `Will ${coin.name} (${coin.symbol}) see ${whaleAmount}+ whale transaction in ${interval.label}?`,
            description: `${coin.emoji} Large transaction of ${whaleAmount}+ detected on-chain within ${interval.label}. Current: $${priceStr}`,
            closesAt,
            category: 'Crypto'
          }
          break
      }
      
      if (market) {
        markets.push(market)
        marketCount++
      }
    }
  }
  
  return markets
}

async function populateShortFomoMarkets() {
  try {
    console.log('🚀 Starting short-term FOMO market population...')
    
    // Fetch latest crypto prices
    const prices = await fetchCryptoPrices()
    console.log('📈 Fetched prices for', Object.keys(prices).length, 'coins')
    
    // Generate short-term markets
    const markets = generateShortTermMarkets(prices)
    console.log(`🎯 Generated ${markets.length} short-term FOMO markets`)
    
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
          yesPool: 500 + Math.floor(Math.random() * 1500), // 500-2000
          noPool: 500 + Math.floor(Math.random() * 1500),  // 500-2000
          totalVolume: 0,
          participants: 0,
          trending: Math.random() > 0.7, // 30% chance to be trending
          image: image || undefined,
          createdBy: 'fomo-system'
        }
      })
      
      created++
      console.log(`✅ Created: ${marketData.question}`)
    }
    
    console.log(`🎉 Successfully created ${created} short-term FOMO markets!`)
    
    return {
      success: true,
      marketsCreated: created,
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
