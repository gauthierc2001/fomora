import { NextRequest, NextResponse } from 'next/server'
import { markets } from '@/lib/storage'
import { populateCryptoMarkets } from '@/scripts/populate-crypto-markets'

// Track if initialization has been attempted to prevent spam
let initializationAttempted = false

export async function POST(request: NextRequest) {
  try {
    // Security: Check if request comes from our own frontend
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    
    // Only allow requests from our own domain during development/production
    if (origin && !origin.includes('localhost') && !origin.includes('railway.app') && !origin.includes('fomora.xyz')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Only initialize if no markets exist
    const marketCount = await markets.size()
    if (marketCount > 0) {
      console.log(`Markets already exist: ${marketCount} markets`)
      return NextResponse.json({
        message: 'Markets already initialized',
        count: marketCount
      })
    }
    
    // Set initialization flag
    initializationAttempted = true
    console.log('🚀 Auto-populating initial markets...')
    
    const marketsCreated = await populateCryptoMarkets()
    console.log(`✅ Created ${marketsCreated} markets`)
    
    return NextResponse.json({
      success: true,
      marketsCreated,
      message: `Initialized ${marketsCreated} prediction markets`
    })
  } catch (error) {
    initializationAttempted = false // Reset on error to allow retry
    console.error('❌ Auto-populate error:', error)
    return NextResponse.json(
      { error: 'Initialization failed' },
      { status: 500 }
    )
  }
}
