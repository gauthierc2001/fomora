import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { launchReset } from '../../../../scripts/launch-reset'

// Admin-only endpoint for launch reset
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check admin privileges (you'll need to implement this check)
    // For now, we'll require a special confirmation parameter
    const body = await request.json()
    const { 
      confirmation,
      dryRun = false,
      resetUserPoints = true,
      resetMarketPools = true,
      resetBets = true,
      newUserPoints = 10000,
      preserveAdmins = true 
    } = body

    // Require explicit confirmation
    if (confirmation !== 'LAUNCH_RESET_CONFIRMED') {
      return NextResponse.json({ 
        error: 'Launch reset requires explicit confirmation',
        required: 'Set confirmation: "LAUNCH_RESET_CONFIRMED"'
      }, { status: 400 })
    }

    console.log(`🚀 Launch reset triggered by ${session.walletAddress}`)
    console.log('Parameters:', { 
      dryRun, resetUserPoints, resetMarketPools, resetBets, newUserPoints, preserveAdmins 
    })

    // Perform the reset
    const result = await launchReset({
      dryRun,
      resetUserPoints,
      resetMarketPools,
      resetBets,
      newUserPoints,
      preserveAdmins
    })

    return NextResponse.json({
      success: true,
      message: dryRun ? 'Dry run completed' : 'Launch reset completed successfully',
      result,
      timestamp: new Date().toISOString(),
      triggeredBy: session.walletAddress
    })

  } catch (error) {
    console.error('❌ Launch reset API error:', error)
    return NextResponse.json(
      { 
        error: 'Launch reset failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Also support GET for dry run preview
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Always dry run for GET requests
    const result = await launchReset({ dryRun: true })

    return NextResponse.json({
      success: true,
      message: 'Launch reset preview (dry run)',
      result,
      note: 'This is a preview. Use POST with confirmation to execute.'
    })

  } catch (error) {
    console.error('❌ Launch reset preview error:', error)
    return NextResponse.json(
      { 
        error: 'Launch reset preview failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
