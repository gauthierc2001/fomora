import { NextResponse } from 'next/server'
import { getTestWindow, getTestTimeRemaining } from '@/lib/config'

export async function GET() {
  try {
    const testWindow = await getTestWindow()
    const timeRemaining = await getTestTimeRemaining()
    
    if (!testWindow) {
      return NextResponse.json({
        testActive: false,
        timeRemaining: 0,
        testWindow: null
      })
    }
    
    const now = new Date()
    const start = new Date(testWindow.startTime)
    const end = new Date(testWindow.endTime)
    
    return NextResponse.json({
      testActive: now >= start && now <= end,
      timeRemaining,
      testWindow: {
        startTime: testWindow.startTime,
        endTime: testWindow.endTime,
        durationHours: testWindow.durationHours
      }
    })
  } catch (error) {
    console.error('Config error:', error)
    return NextResponse.json(
      { error: 'Failed to get config' },
      { status: 500 }
    )
  }
}
