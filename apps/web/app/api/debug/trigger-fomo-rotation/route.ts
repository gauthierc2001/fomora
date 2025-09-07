import { NextRequest, NextResponse } from 'next/server'

// Manual trigger for testing FOMO market rotation
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Manual FOMO rotation trigger')
    
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
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
    
    return NextResponse.json({
      success: true,
      message: 'Manual rotation triggered successfully',
      result
    })
    
  } catch (error) {
    console.error('❌ Manual rotation error:', error)
    return NextResponse.json(
      { 
        error: 'Manual rotation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
