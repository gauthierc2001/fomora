import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@fomora/db'
import { getMarketImage } from '@/lib/market-images'
import { randomUUID } from 'crypto'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Crypto coin data with emojis and descriptions
const CRYPTO_COINS = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    emoji: '₿',
    color: '#F7931A',
    description: 'The original cryptocurrency'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    emoji: '⟠',
    color: '#627EEA',
    description: 'Smart contract platform'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    emoji: '◎',
    color: '#9945FF',
    description: 'High-speed blockchain'
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    emoji: '🐕',
    color: '#C2A633',
    description: 'The meme coin that started it all'
  },
  {
    symbol: 'PEPE',
    name: 'Pepe',
    emoji: '🐸',
    color: '#00D26A',
    description: 'Rare Pepe meme coin'
  },
  {
    symbol: 'SHIB',
    name: 'Shiba Inu',
    emoji: '🐕',
    color: '#FFA409',
    description: 'Dogecoin killer'
  },
  {
    symbol: 'WIF',
    name: 'Dogwifhat',
    emoji: '🐕‍🦺',
    color: '#FFB800',
    description: 'Dog with hat meme'
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    emoji: '🪙',
    color: '#FF6B35',
    description: 'Solana meme coin'
  },
  {
    symbol: 'POPCAT',
    name: 'Popcat',
    emoji: '🐱',
    color: '#9966CC',
    description: 'Viral cat meme'
  },
  {
    symbol: 'PNUT',
    name: 'Peanut',
    emoji: '🥜',
    color: '#8B4513',
    description: 'Peanut the Squirrel tribute'
  },
  {
    symbol: 'FLOKI',
    name: 'Floki',
    emoji: '🐕‍🦺',
    color: '#FFB800',
    description: 'Elon\'s dog inspired coin'
  },
  {
    symbol: 'MEW',
    name: 'Cat in Dogs World',
    emoji: '🐱',
    color: '#FF69B4',
    description: 'Cats vs Dogs narrative'
  }
]

async function fetchCryptoPrices(): Promise<Record<string, number>> {
  try {
    const symbols = CRYPTO_COINS.map(coin => coin.symbol)
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

function generateFomoMarkets(prices: Record<string, number>) {
  const now = new Date()
  const in15Min = new Date(now.getTime() + 15 * 60 * 1000)
  const in30Min = new Date(now.getTime() + 30 * 60 * 1000)
  
  const markets = []
  
  // Select 3-4 random coins for this rotation
  const selectedCoins = CRYPTO_COINS
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
  
  for (const coin of selectedCoins) {
    const currentPrice = prices[coin.symbol] || 1
    const priceFormatted = currentPrice < 1 ? currentPrice.toFixed(6) : currentPrice.toFixed(2)
    
    // Generate different types of markets
    const marketTypes = [
      {
        question: `Will ${coin.name} (${coin.symbol}) break $${(currentPrice * 1.1).toFixed(currentPrice < 1 ? 6 : 2)} in 15 minutes?`,
        description: `${coin.emoji} ${coin.description}. Current price: $${priceFormatted}. Needs to hit $${(currentPrice * 1.1).toFixed(currentPrice < 1 ? 6 : 2)} (+10%) within 15 minutes.`,
        closesAt: in15Min,
        category: 'Crypto'
      },
      {
        question: `Will ${coin.name} (${coin.symbol}) drop below $${(currentPrice * 0.9).toFixed(currentPrice < 1 ? 6 : 2)} in 30 minutes?`,
        description: `${coin.emoji} ${coin.description}. Current price: $${priceFormatted}. Will it fall to $${(currentPrice * 0.9).toFixed(currentPrice < 1 ? 6 : 2)} (-10%) within 30 minutes?`,
        closesAt: in30Min,
        category: 'Crypto'
      },
      {
        question: `Will ${coin.name} (${coin.symbol}) have >$1M volume spike in 15 minutes?`,
        description: `${coin.emoji} ${coin.description}. Will trading volume spike above $1M in the next 15 minutes? Current price: $${priceFormatted}`,
        closesAt: in15Min,
        category: 'Crypto'
      }
    ]
    
    // Pick one random market type for this coin
    const selectedMarket = marketTypes[Math.floor(Math.random() * marketTypes.length)]
    markets.push(selectedMarket)
  }
  
  return markets
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting FOMO market rotation...')
    
    // Close existing open FOMO markets
    await prisma.fomoMarket.updateMany({
      where: {
        status: 'OPEN',
        closesAt: {
          lte: new Date()
        }
      },
      data: {
        status: 'CLOSED'
      }
    })
    
    // Fetch latest crypto prices
    const prices = await fetchCryptoPrices()
    console.log('📈 Fetched prices:', prices)
    
    // Generate new FOMO markets
    const newMarkets = generateFomoMarkets(prices)
    console.log(`🎯 Generated ${newMarkets.length} new FOMO markets`)
    
    // Create new FOMO markets
    for (const marketData of newMarkets) {
      const marketId = randomUUID()
      const slug = marketData.question
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 60)
      
      // Get market image
      const image = await getMarketImage(marketData.question, marketData.description)
      
      await prisma.fomoMarket.create({
        data: {
          id: marketId,
          slug: `${slug}-${Date.now()}`,
          question: marketData.question,
          description: marketData.description,
          category: marketData.category,
          closesAt: marketData.closesAt,
          status: 'OPEN',
          yesPool: 1000 + Math.floor(Math.random() * 2000), // Random initial pools
          noPool: 1000 + Math.floor(Math.random() * 2000),
          totalVolume: 0,
          participants: 0,
          trending: Math.random() > 0.5,
          image: image || undefined,
          createdBy: 'fomo-system'
        }
      })
      
      console.log(`✅ Created FOMO market: ${marketData.question}`)
    }
    
    console.log('🎉 FOMO market rotation complete!')
    
    return NextResponse.json({
      success: true,
      marketsCreated: newMarkets.length,
      message: 'FOMO markets rotated successfully'
    })
    
  } catch (error) {
    console.error('❌ FOMO market rotation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to rotate FOMO markets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
