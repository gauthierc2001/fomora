import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createHash } from 'crypto'
import { getSessionFromRequest } from '@/lib/auth'
// Removed isTestActive import as test restrictions are removed
import { createSlug } from '@/lib/utils'
import { markets, bets, users } from '@/lib/storage'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Create deterministic market ID for user markets
function createUserMarketId(question: string, userId: string): string {
  const hash = createHash('sha256').update(question + userId + 'user').digest('hex').slice(0, 12)
  return `market_user_${hash}`
}

const createMarketSchema = z.object({
  question: z.string().min(10).max(200),
  description: z.string().min(10, 'Description is required and must be at least 10 characters'),
  category: z.string().max(50).optional(),
  closesAt: z.string().refine((date) => {
    // Accept both datetime-local format (YYYY-MM-DDTHH:mm) and ISO format
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime()) && parsedDate > new Date()
  }, 'Must be a valid future date'),
  image: z.string().url('Image URL is required')
})

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  category: z.string().optional(),
  status: z.enum(['OPEN', 'CLOSED', 'RESOLVED', 'CANCELLED']).optional(),
  search: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Removed test window restriction - users can create markets anytime
    
    const body = await request.json()
    console.log('📝 Market creation request body:', JSON.stringify(body, null, 2))
    console.log('📅 closesAt value received:', body.closesAt, 'type:', typeof body.closesAt)
    
    const { question, description, category, closesAt, image } = createMarketSchema.parse(body)
    
    // Parse and validate the closing date
    const closingDate = new Date(closesAt)
    if (isNaN(closingDate.getTime())) {
      return NextResponse.json({ error: 'Invalid closing date format' }, { status: 400 })
    }
    
    if (closingDate <= new Date()) {
      return NextResponse.json({ error: 'Closing date must be in the future' }, { status: 400 })
    }
    
    const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    if (closingDate > oneWeekFromNow) {
      return NextResponse.json({ error: 'Closing date cannot be more than 1 week from now' }, { status: 400 })
    }
    
    console.log('✅ Parsed closing date:', closingDate.toISOString())
    
    // Get user from in-memory storage
    const user = users.get(session.id) || users.get(session.walletAddress)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    if (user.pointsBalance < 100) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
    }
    
    // Check user's market creation limit (3 max)
    const userMarkets = Array.from(markets.values()).filter((m: any) => m.createdBy === user.id || m.createdBy === user.walletAddress)
    if (userMarkets.length >= 3) {
      return NextResponse.json({ error: 'Maximum 3 markets allowed per user' }, { status: 400 })
    }
    
    const slug = createSlug(question)
    const marketId = createUserMarketId(question, user.id)
    
    // Create market in memory
    const market = {
      id: marketId,
      question,
      description,
      category,
      image,
      slug,
      status: 'OPEN' as const,
      yesPool: 0,
      noPool: 0,
      createdAt: new Date(),
      closesAt: closingDate,
      createdBy: user.id
    }
    
    // Deduct points and create market
    user.pointsBalance -= 100
    user.marketsCreated += 1
    
    // Save user and market to persistent storage
    users.set(session.walletAddress, user)
    markets.set(marketId, market)
    
    console.log(`✅ Market created: ${market.id} by ${user.id} (fee: 100 points)`)
    
    return NextResponse.json(market, { status: 201 })
  } catch (error) {
    console.error('Create market error:', error)
    return NextResponse.json(
      { error: 'Failed to create market' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, category, status, search } = querySchema.parse(
      Object.fromEntries(searchParams)
    )
    
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum
    
    // Get all markets from in-memory storage
    let allMarkets = Array.from(markets.values())
    console.log(`Total markets in storage: ${allMarkets.length}`)
    console.log(`Filtering by category: "${category || 'none'}"`)
    
    // Apply filters
    if (category) {
      allMarkets = allMarkets.filter((market: any) => market.category === category)
      console.log(`After category filter: ${allMarkets.length} markets`)
    }
    
    if (status) {
      allMarkets = allMarkets.filter((market: any) => market.status === status)
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      allMarkets = allMarkets.filter((market: any) => 
        market.question.toLowerCase().includes(searchLower) ||
        (market.description && market.description.toLowerCase().includes(searchLower))
      )
    }
    
    // Sort by creation date (newest first)
    allMarkets.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime())
    
    // Apply pagination
    const paginatedMarkets = allMarkets.slice(skip, skip + limitNum)
    
    // Format markets with creator info and bet count
    const formattedMarkets = paginatedMarkets.map((market: any) => ({
      ...(market as any),
      creator: {
        walletAddress: market.createdBy === 'system' ? 'System' : market.createdBy
      },
      _count: {
        bets: Array.from(bets.values()).filter((bet: any) => bet.marketId === market.id).length
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
    console.error('Get markets error:', error)
    return NextResponse.json(
      { error: 'Failed to get markets' },
      { status: 500 }
    )
  }
}
