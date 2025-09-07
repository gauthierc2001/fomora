import { NextRequest, NextResponse } from 'next/server'

// This endpoint will be called by external cron services (like Vercel Cron or Uptime Robot)
export async function GET(request: NextRequest) {
  try {
    console.log('⏰ Cron job triggered: FOMO market rotation')
    
    // Call the admin rotate endpoint
    const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` 
      : process.env.PORT 
        ? `http://localhost:${process.env.PORT}`
        : 'http://localhost:8000'
    
    const response = await fetch(`${baseUrl}/api/admin/rotate-fomo-markets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Rotation failed: ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('✅ Cron rotation result:', result)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result
    })
    
  } catch (error) {
    console.error('❌ Cron rotation error:', error)
    return NextResponse.json(
      { 
        error: 'Cron rotation failed',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
}
