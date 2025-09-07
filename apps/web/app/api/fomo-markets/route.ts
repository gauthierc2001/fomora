import { NextRequest, NextResponse } from 'next/server'
import { fomoMarkets, bets } from '@/lib/storage'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  category: z.string().optional(),
  status: z.enum(['OPEN', 'CLOSED', 'RESOLVED', 'CANCELLED']).optional(),
  search: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, category, status, search } = querySchema.parse(
      Object.fromEntries(searchParams)
    )
    
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum
    
    // Get all FOMO markets from database storage
    let allMarkets = await fomoMarkets.values()
    console.log(`Total FOMO markets in storage: ${allMarkets.length}`)
    console.log(`Filtering by category: "${category || 'none'}"`)
    
    // Apply filters
    if (category) {
      allMarkets = allMarkets.filter(market => market.category === category)
      console.log(`After category filter: ${allMarkets.length} FOMO markets`)
    }
    
    if (status) {
      allMarkets = allMarkets.filter(market => market.status === status)
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      allMarkets = allMarkets.filter(market => 
        market.question.toLowerCase().includes(searchLower) ||
        (market.description && market.description.toLowerCase().includes(searchLower))
      )
    }
    
    // Sort by creation date (newest first)
    allMarkets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    
    // Apply pagination
    const paginatedMarkets = allMarkets.slice(skip, skip + limitNum)
    
    // Format markets with creator info and bet count
    const allBets = await bets.values()
    const formattedMarkets = paginatedMarkets.map(market => ({
      ...market,
      creator: {
        walletAddress: market.createdBy === 'fomo-system' ? 'FOMO System' : market.createdBy
      },
      _count: {
        bets: allBets.filter(bet => bet.marketId === market.id).length
      }
    }))
    
    return NextResponse.json({
      markets: formattedMarkets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: allMarkets.length,
        pages: Math.ceil(allMarkets.length / limitNum)
      }
    })
  } catch (error) {
    console.error('FOMO markets fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FOMO markets' },
      { status: 500 }
    )
  }
}
