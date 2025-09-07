import { prisma } from '@fomora/db'

// Markets are always active, no test window needed
export async function isTestActive(): Promise<boolean> {
  return true
}

export async function getTestTimeRemaining(): Promise<number> {
  // Return a large number to indicate markets are always active
  return Number.MAX_SAFE_INTEGER
}
