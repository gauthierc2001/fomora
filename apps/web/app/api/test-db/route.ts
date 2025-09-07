import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing environment variables...')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET)
    
    return NextResponse.json({
      success: true,
      env: process.env.NODE_ENV,
      hasDatabase: !!process.env.DATABASE_URL,
      hasJWT: !!process.env.JWT_SECRET,
      databaseUrl: process.env.DATABASE_URL?.slice(0, 50) + '...'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Test failed', details: error }, { status: 500 })
  }
}
