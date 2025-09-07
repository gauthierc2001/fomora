import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Cache prices for 1 minute to avoid hitting rate limits
const CACHE_DURATION = 60 * 1000 // 1 minute
let priceCache: {
  timestamp: number
  prices: Record<string, number>
} | null = null

// Map common symbols to CoinGecko IDs
const symbolToId: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'DOGE': 'dogecoin',
  'PEPE': 'pepe',
  'SHIB': 'shiba-inu',
  'FLOKI': 'floki',
  'BONK': 'bonk',
  'WIF': 'dogwifcoin',
  'POPCAT': 'popcat',
  'GOAT': 'goatseus-maximus',
  'PNUT': 'peanut-the-squirrel',
  'BRETT': 'based-brett',
  'MEW': 'cat-in-a-dogs-world',
  'MOODENG': 'moo-deng',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'AVAX': 'avalanche-2',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'UNI': 'uniswap'
}

const symbolSchema = z.object({
  symbols: z.array(z.string()).optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { symbols } = symbolSchema.parse(Object.fromEntries(searchParams))

    // Check cache first
    const now = Date.now()
    if (priceCache && now - priceCache.timestamp < CACHE_DURATION) {
      console.log('Returning cached prices')
      return NextResponse.json(priceCache.prices)
    }

    // Default symbols if none provided - include major coins and popular memecoins
    const defaultSymbols = ['BTC', 'ETH', 'SOL', 'DOGE', 'PEPE', 'SHIB', 'WIF', 'BONK', 'POPCAT', 'PNUT']
    const symbolsToFetch = symbols || defaultSymbols

    // Convert symbols to CoinGecko IDs
    const ids = symbolsToFetch
      .map(symbol => symbolToId[symbol])
      .filter(id => id) // Remove undefined entries
      .join(',')

    // Fetch latest prices from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Convert CoinGecko response format to our format
    const prices: Record<string, number> = {}
    for (const symbol of symbolsToFetch) {
      const id = symbolToId[symbol]
      if (id && data[id]) {
        prices[symbol] = data[id].usd
      }
    }

    // Update cache
    priceCache = {
      timestamp: now,
      prices
    }

    return NextResponse.json(prices)
  } catch (error) {
    console.error('Crypto prices fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crypto prices' },
      { status: 500 }
    )
  }
}
