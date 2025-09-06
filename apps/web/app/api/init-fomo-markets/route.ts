import { NextRequest, NextResponse } from 'next/server'
import { fomoMarkets } from '@/lib/storage'
import { populateFomoMarkets } from '@/scripts/populate-fomo-markets'

// Track if initialization has been attempted to prevent spam
let initializationAttempted = false

export async function POST(request: NextRequest) {
  try {
    // Security: Check if request comes from our own frontend
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    
    // Only allow requests from our own domain during development/production
    if (origin && !origin.includes('localhost') && !origin.includes('vercel.app') && !origin.includes(process.env.VERCEL_URL || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Only initialize if no FOMO markets exist
    if (fomoMarkets.size > 0) {
      console.log(`FOMO markets already exist: ${fomoMarkets.size} markets`)
      return NextResponse.json({
        message: 'FOMO markets already initialized',
        count: fomoMarkets.size
      })
    }
    
    // Set initialization flag
    initializationAttempted = true
    console.log('🔥 Auto-populating initial FOMO markets...')
    
    const marketsCreated = await populateFomoMarkets()
    console.log(`✅ Created ${marketsCreated} FOMO markets`)
    
    return NextResponse.json({
      success: true,
      marketsCreated,
      message: `Initialized ${marketsCreated} FOMO prediction markets`
    })
  } catch (error) {
    initializationAttempted = false // Reset on error to allow retry
    console.error('❌ FOMO auto-populate error:', error)
    return NextResponse.json(
      { error: 'FOMO initialization failed' },
      { status: 500 }
    )
  }
}
