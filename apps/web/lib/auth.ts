import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { prisma } from '@fomora/db'
import { createHash } from 'crypto'

// Validate JWT_SECRET in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production')
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev')

export interface SessionUser {
  id: string
  walletAddress: string
  role: 'USER' | 'ADMIN'
  pointsBalance: number
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)

  const isProduction = process.env.NODE_ENV === 'production'
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
    // Don't set domain in production to allow cookies to work across subdomains
    ...(isProduction ? {} : { domain: undefined })
  }

  cookies().set('session', token, cookieOptions)

  return token
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get('session')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    return payload.user as SessionUser
  } catch {
    return null
  }
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionUser | null> {
  const token = request.cookies.get('session')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    return payload.user as SessionUser
  } catch {
    return null
  }
}

export async function destroySession() {
  cookies().delete('session')
}

// Signature verification removed for simplified demo auth

export function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex')
}

export async function logAction(
  type: 'CONNECT' | 'CREDITS' | 'CREATE_MARKET' | 'BET' | 'RESOLVE' | 'CANCEL' | 'LOGIN' | 'ADMIN_ACTION',
  metadata: any = {},
  userId?: string,
  request?: NextRequest
) {
  const ipHash = request ? hashIP(getClientIP(request)) : undefined

  await prisma.actionLog.create({
    data: {
      type,
      metadata,
      userId,
      ipHash
    }
  })
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (real) {
    return real
  }
  
  return '127.0.0.1'
}
