import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPoints(points: number): string {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`
  }
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`
  }
  return points.toLocaleString()
}

export function formatOdds(yesPool: number, noPool: number): { yes: number; no: number } {
  const total = yesPool + noPool
  if (total === 0) return { yes: 50, no: 50 }
  
  // In prediction markets, odds represent probability
  // YES probability = noPool / total (counterintuitive but correct)
  // NO probability = yesPool / total
  // This is because more betting on one side makes the other side more valuable
  const yesProbability = Math.round((noPool / total) * 100)
  const noProbability = Math.round((yesPool / total) * 100)
  
  // Ensure probabilities are never negative and always add up to 100
  const adjustedYes = Math.max(0, Math.min(100, yesProbability))
  const adjustedNo = Math.max(0, Math.min(100, noProbability))
  
  // If both are 0, return 50/50
  if (adjustedYes === 0 && adjustedNo === 0) {
    return { yes: 50, no: 50 }
  }
  
  // Normalize to ensure they add up to 100
  const sum = adjustedYes + adjustedNo
  if (sum === 0) return { yes: 50, no: 50 }
  
  return {
    yes: Math.round((adjustedYes / sum) * 100),
    no: Math.round((adjustedNo / sum) * 100)
  }
}

export function calculatePayout(
  userBet: number,
  userSide: 'YES' | 'NO',
  totalYes: number,
  totalNo: number,
  winSide: 'YES' | 'NO'
): number {
  if (userSide !== winSide) return 0
  
  const winPool = winSide === 'YES' ? totalYes : totalNo
  const losePool = winSide === 'YES' ? totalNo : totalYes
  
  if (winPool === 0) return 0
  
  const share = userBet / winPool
  return Math.floor(share * losePool + userBet)
}

export function calculatePotentialEarnings(
  betAmount: number,
  betSide: 'YES' | 'NO',
  currentYesPool: number,
  currentNoPool: number
): { potentialEarnings: number; impliedOdds: number; breakEvenPoint: number } {
  // Ensure inputs are numbers and non-negative
  betAmount = Math.max(0, Number(betAmount) || 0)
  currentYesPool = Math.max(0, Number(currentYesPool) || 0)
  currentNoPool = Math.max(0, Number(currentNoPool) || 0)

  // Calculate what pools would be after this bet
  const newYesPool = betSide === 'YES' ? currentYesPool + betAmount : currentYesPool
  const newNoPool = betSide === 'NO' ? currentNoPool + betAmount : currentNoPool
  
  // Calculate potential payout if user wins
  const potentialPayout = calculatePayout(betAmount, betSide, newYesPool, newNoPool, betSide)
  const potentialEarnings = Math.max(0, potentialPayout - betAmount)
  
  // Calculate implied probability (market's assessment of likelihood)
  const totalPool = newYesPool + newNoPool
  let impliedOdds = 50
  if (totalPool > 0) {
    impliedOdds = betSide === 'YES' ? 
      (newNoPool / totalPool) * 100 : 
      (newYesPool / totalPool) * 100
  }
  
  // Calculate break-even point
  let breakEvenPoint = 50
  if (potentialPayout > 0) {
    breakEvenPoint = (betAmount / potentialPayout) * 100
  }
  
  return {
    potentialEarnings,
    impliedOdds: Math.round(Math.max(0, Math.min(100, impliedOdds)) * 10) / 10,
    breakEvenPoint: Math.round(Math.max(0, Math.min(100, breakEvenPoint)) * 10) / 10
  }
}

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60)
}

export function getTimeRemaining(endTime: Date): {
  hours: number
  minutes: number
  seconds: number
  total: number
} {
  const total = endTime.getTime() - Date.now()
  
  if (total <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, total: 0 }
  }
  
  const hours = Math.floor(total / (1000 * 60 * 60))
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((total % (1000 * 60)) / 1000)
  
  return { hours, minutes, seconds, total }
}
