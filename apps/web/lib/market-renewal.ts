import { markets, fomoMarkets } from './storage'
import { validateMarket, validateClosingTime } from './market-validator'
import { createHash } from 'crypto'

function createMarketId(question: string, category: string): string {
  const hash = createHash('sha256')
    .update(question + category)
    .digest('hex')
    .slice(0, 12)
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

export async function renewMarket(market: any) {
  try {
    // Don't renew if market is still open
    if (market.status === 'OPEN') return null

    // Validate market is still relevant
    const validation = validateMarket(market.question, market.description)
    if (!validation.isValid) {
      console.log(`Market not renewed - ${validation.reason}`)
      return null
    }

    // Create new closing time
    const now = new Date()
    const newClosesAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

    // Validate new closing time
    const timeValidation = validateClosingTime(newClosesAt)
    if (!timeValidation.isValid) {
      console.log(`Market not renewed - ${timeValidation.reason}`)
      return null
    }

    // Create renewed market
    const renewedMarket = {
      id: createMarketId(market.question + '_renewed', market.category),
      slug: createSlug(market.question),
      question: market.question,
      description: market.description,
      category: market.category,
      createdBy: market.createdBy,
      status: 'OPEN',
      closesAt: newClosesAt,
      createdAt: now,
      yesPool: 1000, // Initial liquidity
      noPool: 1000,  // Initial liquidity
      createFee: 100
    }

    // Save to appropriate storage
    if (market.id.includes('fomo')) {
      await fomoMarkets.set(renewedMarket.id, renewedMarket)
    } else {
      await markets.set(renewedMarket.id, renewedMarket)
    }

    console.log(`✨ Market renewed: ${renewedMarket.question}`)
    return renewedMarket
  } catch (error) {
    console.error('Failed to renew market:', error)
    return null
  }
}

export async function checkAndRenewMarkets() {
  try {
    const now = new Date()
    
    // Get all markets
    const regularMarkets = await markets.values()
    const fomoMarkets = await fomoMarkets.values()
    const allMarkets = [...regularMarkets, ...fomoMarkets]

    // Check each market
    for (const market of allMarkets) {
      const closingTime = new Date(market.closesAt)
      
      // If market is closed and was popular (high volume)
      if (market.status === 'CLOSED' && (market.yesPool + market.noPool) > 5000) {
        await renewMarket(market)
      }
      // If market is about to close but has high activity
      else if (market.status === 'OPEN' && 
               now >= closingTime && 
               (market.yesPool + market.noPool) > 10000) {
        // Create renewed version before closing
        await renewMarket(market)
        
        // Close current market
        market.status = 'CLOSED'
        if (market.id.includes('fomo')) {
          await fomoMarkets.set(market.id, market)
        } else {
          await markets.set(market.id, market)
        }
      }
    }
  } catch (error) {
    console.error('Failed to check and renew markets:', error)
  }
}
