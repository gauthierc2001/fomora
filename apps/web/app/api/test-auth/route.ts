import { NextRequest, NextResponse } from 'next/server'
import { users } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    console.log('=== AUTH TEST ENDPOINT ===')
    console.log('Environment:', process.env.NODE_ENV)
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 30) + '...')
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET)
    
    // Test database connection
    console.log('Testing database connection...')
    const userCount = await users.size()
    console.log('Database connection successful! User count:', userCount)
    
    // Test creating a simple user
    console.log('Testing user creation...')
    const testWallet = 'TestWallet123456789012345678901234567890'
    const existingUser = await users.get(testWallet)
    
    if (!existingUser) {
      const testUser = {
        id: `test_${Date.now()}`,
        walletAddress: testWallet,
        role: 'USER' as const,
        pointsBalance: 1000,
        creditedInitial: true,
        ipHash: 'test-hash',
        displayName: 'Test User',
        profilePicture: undefined,
        createdAt: new Date(),
        totalBets: 0,
        totalWagered: 0,
        marketsCreated: 0
      }
      
      await users.set(testWallet, testUser)
      console.log('Test user created successfully!')
    } else {
      console.log('Test user already exists')
    }
    
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      databaseConnected: true,
      userCount,
      message: 'All systems working!'
    })
    
  } catch (error) {
    console.error('=== AUTH TEST FAILED ===')
    console.error('Error:', error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
      databaseUrl: !!process.env.DATABASE_URL,
      jwtSecret: !!process.env.JWT_SECRET
    }, { status: 500 })
  }
}
