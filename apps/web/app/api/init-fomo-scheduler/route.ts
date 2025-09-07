import { NextRequest, NextResponse } from 'next/server'
import { startFomoScheduler } from '@/lib/fomo-scheduler'

// Endpoint to manually start the FOMO scheduler
export async function POST(request: NextRequest) {
  try {
    startFomoScheduler()
    
    return NextResponse.json({
      success: true,
      message: 'FOMO scheduler started successfully'
    })
  } catch (error) {
    console.error('Failed to start FOMO scheduler:', error)
    return NextResponse.json(
      { 
        error: 'Failed to start FOMO scheduler',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
