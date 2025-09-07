import { NextRequest, NextResponse } from 'next/server'
import { populateShortFomoMarkets } from '../../../scripts/populate-short-fomo-markets'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Populating short-term FOMO markets...')
    
    const result = await populateShortFomoMarkets()
    
    return NextResponse.json({
      success: true,
      message: 'Short-term FOMO markets created successfully',
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
