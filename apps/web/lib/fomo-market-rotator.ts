import { prisma } from '@fomora/db'
import { populateShortFomoMarkets } from './populate-short-fomo-markets'

export async function rotateFomoMarkets() {
  try {
    console.log('🔄 Starting FOMO market rotation...')
    
    // Safety check: Don't run if there are active bets being processed
    const activeBetsCount = await prisma.bet.count({
      where: {
        marketType: 'FOMO',
        createdAt: {
          gte: new Date(Date.now() - 30 * 1000) // Created in last 30 seconds
        }
      }
    })
    
    if (activeBetsCount > 0) {
      console.log('⚠️ Active FOMO bets detected, skipping rotation to avoid conflicts')
      return { rotated: 0, newMarkets: 0, skipped: true, reason: 'active_bets' }
    }
    
    // 1. Check for closed markets
    const now = new Date()
    const closedMarkets = await (prisma as any).fomoMarket.findMany({
      where: {
        status: 'OPEN',
        closesAt: {
          lte: now
        },
        createdBy: 'fomo-system' // Only rotate system-created markets
      }
    })
    
    console.log(`📊 Found ${closedMarkets.length} FOMO markets that should be closed`)
    
    if (closedMarkets.length === 0) {
      console.log('⏰ No markets ready for rotation yet')
      return { rotated: 0, newMarkets: 0 }
    }
    
    // Safety check: Don't close markets with recent bets
    const marketsWithRecentBets = await prisma.bet.findMany({
      where: {
        marketId: {
          in: closedMarkets.map((m: any) => m.id)
        },
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000) // Bets in last 60 seconds
        }
      },
      select: { marketId: true }
    })
    
    const safeToCloseMarkets = closedMarkets.filter((market: any) => 
      !marketsWithRecentBets.some(bet => bet.marketId === market.id)
    )
    
    if (safeToCloseMarkets.length === 0) {
      console.log('⚠️ All expired markets have recent bets, skipping rotation for safety')
      return { rotated: 0, newMarkets: 0, skipped: true, reason: 'recent_bets' }
    }
    
    console.log(`✅ Safe to close ${safeToCloseMarkets.length} markets (${closedMarkets.length - safeToCloseMarkets.length} have recent activity)`)
    
    // 2. Close expired markets (only the safe ones)
    const closedCount = await (prisma as any).fomoMarket.updateMany({
      where: {
        id: {
          in: safeToCloseMarkets.map((m: any) => m.id)
        }
      },
      data: {
        status: 'CLOSED'
      }
    })
    
    console.log(`🔒 Closed ${closedCount.count} expired FOMO markets`)
    
    // 3. Calculate how many new markets to create based on closed ones
    const marketsToCreate = Math.min(safeToCloseMarkets.length, 10) // Create up to 10 new markets
    
    if (marketsToCreate > 0) {
      console.log(`🚀 Creating ${marketsToCreate} new FOMO markets with fresh prices...`)
      
      // Safety check: Don't create too many markets
      const currentActiveMarkets = await (prisma as any).fomoMarket.count({
        where: {
          status: 'OPEN',
          createdBy: 'fomo-system'
        }
      })
      
      if (currentActiveMarkets > 25) {
        console.log(`⚠️ Too many active markets (${currentActiveMarkets}), limiting new market creation`)
        return { 
          rotated: closedCount.count, 
          newMarkets: 0, 
          skipped: true, 
          reason: 'too_many_active_markets' 
        }
      }
      
      // 4. Create new markets with fresh prices (but don't clear existing ones)
      try {
        const result = await populateShortFomoMarkets(false)
        
        console.log(`✅ Market rotation complete: ${closedCount.count} closed, ${result.marketsCreated} created`)
        
        return {
          rotated: closedCount.count,
          newMarkets: result.marketsCreated,
          coinsWithLogos: result.coinsWithLogos,
          breakdown: result.breakdown
        }
      } catch (marketCreationError) {
        console.error('❌ Failed to create new markets:', marketCreationError)
        // Return partial success - we at least closed the expired markets
        return {
          rotated: closedCount.count,
          newMarkets: 0,
          error: 'Failed to create new markets',
          details: marketCreationError instanceof Error ? marketCreationError.message : 'Unknown error'
        }
      }
    }
    
    return { rotated: closedCount.count, newMarkets: 0 }
    
  } catch (error) {
    console.error('❌ FOMO market rotation failed:', error)
    throw error
  }
}

export async function getActiveMarketStats() {
  try {
    const now = new Date()
    
    const [activeCount, expiringCount, totalVolume] = await Promise.all([
      // Active markets
      (prisma as any).fomoMarket.count({
        where: {
          status: 'OPEN',
          closesAt: { gt: now },
          createdBy: 'fomo-system'
        }
      }),
      
      // Markets expiring in next 5 minutes
      (prisma as any).fomoMarket.count({
        where: {
          status: 'OPEN',
          closesAt: { 
            gte: now,
            lte: new Date(now.getTime() + 5 * 60 * 1000)
          },
          createdBy: 'fomo-system'
        }
      }),
      
      // Total volume across all active FOMO markets
      (prisma as any).fomoMarket.aggregate({
        where: {
          status: 'OPEN',
          createdBy: 'fomo-system'
        },
        _sum: {
          totalVolume: true
        }
      })
    ])
    
    return {
      activeMarkets: activeCount,
      expiringInNext5Min: expiringCount,
      totalVolume: totalVolume._sum.totalVolume || 0,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('❌ Failed to get market stats:', error)
    return {
      activeMarkets: 0,
      expiringInNext5Min: 0,
      totalVolume: 0,
      timestamp: new Date().toISOString()
    }
  }
}
