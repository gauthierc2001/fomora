import { NextRequest, NextResponse } from 'next/server'
import { populateShortFomoMarkets } from '../../../scripts/populate-short-fomo-markets'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Populating short-term FOMO markets with live CoinGecko data...')
    
    // Check if we should clear existing markets
    const body = await request.json().catch(() => ({}))
    const clearExisting = body.clearExisting === true
    
    if (clearExisting) {
      console.log('🧹 Clearing existing short-term markets first...')
    }
    
    const result = await populateShortFomoMarkets(clearExisting)
    
    return NextResponse.json({
      success: true,
      message: 'Short-term FOMO markets created successfully with live CoinGecko prices',
      result,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Short-term FOMO population error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to populate short-term FOMO markets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
