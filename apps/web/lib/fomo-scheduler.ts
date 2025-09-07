// FOMO Market Rotation Scheduler for Railway
let rotationInterval: NodeJS.Timeout | null = null
let isRotating = false

const ROTATION_INTERVAL = 15 * 60 * 1000 // 15 minutes

async function rotateFomoMarkets() {
  if (isRotating) {
    console.log('⏳ FOMO rotation already in progress, skipping...')
    return
  }

  isRotating = true
  console.log('🔄 Starting scheduled FOMO market rotation...')

  try {
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

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Scheduled FOMO rotation completed:', result)
    } else {
      console.error('❌ Scheduled FOMO rotation failed:', response.statusText)
    }
  } catch (error) {
    console.error('❌ Scheduled FOMO rotation error:', error)
  } finally {
    isRotating = false
  }
}

export function startFomoScheduler() {
  if (rotationInterval) {
    console.log('🔄 FOMO scheduler already running')
    return
  }

  console.log(`🚀 Starting FOMO market scheduler (every ${ROTATION_INTERVAL / 60000} minutes)`)
  
  // Run initial rotation after 1 minute (to let the app fully start)
  setTimeout(() => {
    rotateFomoMarkets()
  }, 60 * 1000)

  // Set up recurring rotation
  rotationInterval = setInterval(() => {
    rotateFomoMarkets()
  }, ROTATION_INTERVAL)
}

export function stopFomoScheduler() {
  if (rotationInterval) {
    clearInterval(rotationInterval)
    rotationInterval = null
    console.log('⏹️ FOMO scheduler stopped')
  }
}

// Auto-start in production or when running on Railway
if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT || process.env.PORT) {
  console.log('🚂 Server environment detected, auto-starting FOMO scheduler in 5 seconds...')
  setTimeout(() => {
    startFomoScheduler()
  }, 5000) // Delay to ensure app is fully started
}
