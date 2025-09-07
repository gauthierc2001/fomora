import { prisma } from '@fomora/db'

export interface TestWindow {
  startTime: string
  endTime: string
  durationHours: number
}

export async function getTestWindow(): Promise<TestWindow | null> {
  try {
    const startTime = process.env.TEST_START_ISO
    const hours = parseInt(process.env.TEST_HOURS || '48')
    
    if (!startTime) return null
    
    const start = new Date(startTime)
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000)
    
    return {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationHours: hours
    }
  } catch {
    return null
  }
}

export async function isTestActive(): Promise<boolean> {
  const testWindow = await getTestWindow()
  if (!testWindow) return false
  
  const now = new Date()
  const start = new Date(testWindow.startTime)
  const end = new Date(testWindow.endTime)
  
  return now >= start && now <= end
}

export async function getTestTimeRemaining(): Promise<number> {
  const testWindow = await getTestWindow()
  if (!testWindow) return 0
  
  const now = new Date()
  const end = new Date(testWindow.endTime)
  
  return Math.max(0, end.getTime() - now.getTime())
}

export function getTestStartFromEnv(): Date {
  const envStart = process.env.TEST_START_ISO
  if (envStart) {
    return new Date(envStart)
  }
  
  // Default: current time if not set
  return new Date()
}

export function getTestEndFromEnv(): Date {
  const start = getTestStartFromEnv()
  const hours = parseInt(process.env.TEST_HOURS || '48')
  return new Date(start.getTime() + hours * 60 * 60 * 1000)
}
