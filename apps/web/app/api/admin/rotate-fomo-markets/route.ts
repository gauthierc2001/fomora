import { NextRequest, NextResponse } from 'next/server'
import { rotateFomoMarkets, getActiveMarketStats } from '@/lib/fomo-market-rotator'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// This API now uses the new rotation system from /lib/fomo-market-rotator.ts

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting scheduled FOMO market rotation...')
    
    // Use the new rotation system
    const result = await rotateFomoMarkets()
    
    console.log('🎉 FOMO market rotation complete!', result)
    
    return NextResponse.json({
      success: true,
      message: 'FOMO markets rotated successfully with fresh CoinGecko prices',
      result,
      timestamp: new Date().toISOString()
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

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Getting FOMO market stats...')
    
    const stats = await getActiveMarketStats()
    
    return NextResponse.json({
      success: true,
      stats,
      message: 'FOMO market statistics retrieved successfully'
    })
    
  } catch (error) {
    console.error('❌ Failed to get FOMO market stats:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get market statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
