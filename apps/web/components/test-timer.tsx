'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface TestConfig {
  testActive: boolean
  timeRemaining: number
  testWindow: {
    startTime: string
    endTime: string
    durationHours: number
  } | null
}

export function TestTimer() {
  const [timeLeft, setTimeLeft] = useState(0)
  
  const { data: config } = useQuery({
    queryKey: ['test-config'],
    queryFn: async (): Promise<TestConfig> => {
      const response = await fetch('/api/config')
      if (!response.ok) throw new Error('Failed to fetch config')
      return response.json()
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  useEffect(() => {
    if (!config?.testWindow) return

    const updateTimer = () => {
      const end = new Date(config.testWindow!.endTime)
      const now = new Date()
      const remaining = Math.max(0, end.getTime() - now.getTime())
      setTimeLeft(remaining)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [config])

  if (!config?.testWindow) return null

  const hours = Math.floor(timeLeft / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

  const isActive = config.testActive && timeLeft > 0

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "🟢 LIVE" : "🔴 ENDED"}
      </Badge>
      <span className="text-sm font-mono">
        {isActive ? (
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        ) : (
          "Test Complete"
        )}
      </span>
    </div>
  )
}
