// Market validation utilities
export function validateMarket(question: string, description: string): {
  isValid: boolean
  reason?: string
} {
  // Convert to lowercase for easier matching
  const text = (question + ' ' + description).toLowerCase()

  // Check for outdated events
  const outdatedEvents = [
    {
      pattern: /eth.*etf.*approv/,
      reason: 'ETH ETFs have already been approved'
    },
    {
      pattern: /mbappe.*madrid/,
      reason: 'Mbappé has already joined Real Madrid'
    },
    {
      pattern: /vision.*pro.*launch|vision.*pro.*pre.*order/,
      reason: 'Vision Pro has already launched'
    },
    {
      pattern: /australian.*open.*2024|aus.*open.*2024/,
      reason: '2024 Australian Open is already completed'
    },
    {
      pattern: /gpt.*5.*q1.*2024/,
      reason: 'Q1 2024 has already passed'
    }
  ]

  for (const event of outdatedEvents) {
    if (event.pattern.test(text)) {
      return {
        isValid: false,
        reason: event.reason
      }
    }
  }

  // Check for date references
  const currentYear = new Date().getFullYear()
  const yearPattern = new RegExp(`\\b${currentYear - 1}\\b`)
  if (yearPattern.test(text)) {
    return {
      isValid: false,
      reason: `Contains outdated year reference: ${currentYear - 1}`
    }
  }

  // Check for specific crypto price references
  const pricePattern = /\$[0-9,]+/g
  const prices = text.match(pricePattern)
  if (prices) {
    // If price is mentioned, it should be in the description with "current:" reference
    if (!description.toLowerCase().includes('current:')) {
      return {
        isValid: false,
        reason: 'Price predictions must include current price reference'
      }
    }
  }

  return { isValid: true }
}

// Utility to check if a market is time-sensitive
export function isTimeSensitive(question: string, description: string): boolean {
  const text = (question + ' ' + description).toLowerCase()
  
  const timePatterns = [
    /this month/,
    /this week/,
    /today/,
    /tomorrow/,
    /next \d+ days/,
    /by (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/
  ]

  return timePatterns.some(pattern => pattern.test(text))
}

// Validate market closing time
export function validateClosingTime(closesAt: Date): {
  isValid: boolean
  reason?: string
} {
  const now = new Date()
  const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate())
  
  if (closesAt < now) {
    return {
      isValid: false,
      reason: 'Market cannot close in the past'
    }
  }

  if (closesAt > twoYearsFromNow) {
    return {
      isValid: false,
      reason: 'Market cannot close more than 2 years in the future'
    }
  }

  return { isValid: true }
}
