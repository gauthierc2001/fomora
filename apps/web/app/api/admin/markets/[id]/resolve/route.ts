import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionFromRequest, logAction } from '@/lib/auth'
import { prisma } from '@fomora/db'
import { calculatePayout } from '@/lib/utils'

const resolveSchema = z.object({
  resolution: z.enum(['YES', 'NO', 'CANCELLED']),
  evidenceUrl: z.string().url().optional(),
  note: z.string().max(500).optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    const body = await request.json()
    const { resolution, evidenceUrl, note } = resolveSchema.parse(body)
    
    // Get market with bets
    const market = await prisma.market.findUnique({
      where: { id: params.id },
      include: {
        bets: {
          include: {
            user: true
          }
        }
      }
    })
    
    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }
    
    if (market.status === 'RESOLVED') {
      return NextResponse.json({ error: 'Market already resolved' }, { status: 400 })
    }
    
    // Process resolution in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update market
      const updatedMarket = await tx.market.update({
        where: { id: params.id },
        data: {
          status: 'RESOLVED',
          resolution,
          resolvedAt: new Date()
        }
      })
      
      if (resolution === 'CANCELLED') {
        // Refund all bets
        for (const bet of market.bets) {
          await tx.user.update({
            where: { id: bet.userId },
            data: {
              pointsBalance: { increment: bet.amount + bet.fee }
            }
          })
        }
      } else {
        // Calculate and distribute payouts
        const winSide = resolution
        const totalYes = market.yesPool
        const totalNo = market.noPool
        
        for (const bet of market.bets) {
          if (bet.side === winSide) {
            const payout = calculatePayout(bet.amount, bet.side, totalYes, totalNo, winSide)
            
            await tx.user.update({
              where: { id: bet.userId },
              data: {
                pointsBalance: { increment: payout }
              }
            })
          }
        }
      }
      
      return updatedMarket
    })
    
    await logAction('RESOLVE', {
      marketId: params.id,
      resolution,
      evidenceUrl,
      note,
      totalYes: market.yesPool,
      totalNo: market.noPool,
      totalBets: market.bets.length
    }, session.id, request)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Resolve market error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve market' },
      { status: 500 }
    )
  }
}
