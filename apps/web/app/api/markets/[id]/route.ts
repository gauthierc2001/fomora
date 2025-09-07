import { NextRequest, NextResponse } from 'next/server'
import { markets, fomoMarkets } from '@/lib/storage'
import { checkAndRenewMarkets } from '@/lib/market-renewal'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log(`🔍 Fetching market: ${id}`)
    
    // Check both regular markets and FOMO markets
    let market = await markets.get(id) || await fomoMarkets.get(id)
    
    if (market) {
      console.log(`✅ Found market ${id}:`, {
        question: market.question,
        yesPool: market.yesPool,
        noPool: market.noPool,
        status: market.status
      })
    }
    
    // If market not found and it looks like an old-style ID, try to find by question similarity
    if (!market && id.includes('_')) {
      console.log(`Market ${id} not found, searching for similar markets...`)
      
      // Try to find a market with similar content based on ID pattern
      // Search in both regular markets and FOMO markets
      const allMarkets = [...markets.entries(), ...fomoMarkets.entries()]
      
      if (id.includes('meme') || id.includes('doge')) {
        // Look for Dogecoin market
        for (const [marketId, marketData] of allMarkets) {
          if (marketId.includes('doge') && marketData.question.toLowerCase().includes('dogecoin')) {
            console.log(`Redirecting to new Dogecoin market: ${marketId}`)
            market = marketData
            break
          }
        }
      } else if (id.includes('pepe')) {
        // Look for Pepe market
        for (const [marketId, marketData] of allMarkets) {
          if (marketId.includes('pepe') && marketData.question.toLowerCase().includes('pepe')) {
            console.log(`Redirecting to new Pepe market: ${marketId}`)
            market = marketData
            break
          }
        }
      } else if (id.includes('shib')) {
        // Look for Shiba market
        for (const [marketId, marketData] of allMarkets) {
          if (marketId.includes('shib') && marketData.question.toLowerCase().includes('shiba')) {
            console.log(`Redirecting to new Shiba market: ${marketId}`)
            market = marketData
            break
          }
        }
      }
    }
    
    if (!market) {
      console.log(`Market ${id} not found in ${markets.size} regular markets and ${fomoMarkets.size} FOMO markets`)
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }

    // Check for market renewals in the background
    checkAndRenewMarkets().catch(console.error)
    
    return NextResponse.json(market)
  } catch (error) {
    console.error('Get market error:', error)
    return NextResponse.json(
      { error: 'Failed to get market' },
      { status: 500 }
    )
  }
}