'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, TrendingUp, Users, DollarSign, Info } from 'lucide-react'
import { useState } from 'react'
import { calculatePotentialEarnings, formatOdds } from '@/lib/utils'

interface MarketPageProps {
  params: { id: string }
}

export default function MarketPage({ params }: MarketPageProps) {
  const { id } = params
  const queryClient = useQueryClient()
  const [betAmount, setBetAmount] = useState('')
  const [selectedSide, setSelectedSide] = useState<'YES' | 'NO' | null>(null)

  const { data: market, isLoading, error } = useQuery({
    queryKey: ['market', id],
    queryFn: async () => {
      const response = await fetch(`/api/markets/${id}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Market not found')
      }
      return response.json()
    },
    retry: 2, // Retry failed requests twice
    retryDelay: 1000, // Wait 1 second between retries
    refetchInterval: 3000, // Refetch every 3 seconds
    refetchIntervalInBackground: true, // Refetch even when tab is in background
    staleTime: 0, // Consider data immediately stale
    cacheTime: 0, // Don't cache data
  })

  const { data: user } = useQuery({
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    cacheTime: 0,
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/me')
      if (!response.ok) {
        console.error('Failed to fetch user:', response.status)
        throw new Error('Not authenticated')
      }
      const userData = await response.json()
      console.log('User data fetched:', userData.walletAddress?.slice(0, 8), 'Balance:', userData.pointsBalance)
      return userData
    }
  })

  const { data: userBets, refetch: refetchUserBets } = useQuery({
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    cacheTime: 0,
    queryKey: ['userBets', id],
    queryFn: async () => {
      const response = await fetch(`/api/markets/${id}/user-bets`)
      if (!response.ok) return { bets: [] }
      return response.json()
    },
    enabled: !!user
  })

  const placeBetMutation = useMutation({
    mutationFn: async ({ side, amount }: { side: 'YES' | 'NO', amount: number }) => {
      console.log(`🎰 Placing bet: ${amount} points on ${side} for market ${id}`)
      const response = await fetch(`/api/markets/${id}/bet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ side, amount })
      })
      if (!response.ok) {
        const error = await response.json()
        console.error('Bet failed:', error)
        throw new Error(error.error || 'Failed to place bet')
      }
      const result = await response.json()
      console.log('✅ Bet successful:', result)
      return result
    },
    onMutate: async ({ side, amount }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['market', id] })

      // Snapshot the previous value
      const previousMarket = queryClient.getQueryData(['market', id])

      // Optimistically update market pools
      queryClient.setQueryData(['market', id], (old: any) => {
        if (!old) return old
        const netAmount = Math.floor(amount * 0.99) // 1% fee
        return {
          ...old,
          yesPool: side === 'YES' ? (old.yesPool || 0) + netAmount : old.yesPool,
          noPool: side === 'NO' ? (old.noPool || 0) + netAmount : old.noPool
        }
      })

      return { previousMarket }
    },
    onSuccess: (data) => {
      console.log('Bet mutation success, updating UI with real data...')
      
      // Update market data with real response
      queryClient.setQueryData(['market', id], (old: any) => {
        if (!old) return old
        return {
          ...old,
          yesPool: data.marketPools.yesPool,
          noPool: data.marketPools.noPool
        }
      })
      
      // Update user balance with real response
      queryClient.setQueryData(['user'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          pointsBalance: data.newBalance
        }
      })
      
      // Refetch user bets to show new bet
      refetchUserBets()
      setBetAmount('')
      setSelectedSide(null)
    },
    onError: (err, variables, context) => {
      console.error('Bet mutation error:', err)
      // Rollback on error
      if (context?.previousMarket) {
        queryClient.setQueryData(['market', id], context.previousMarket)
      }
      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['market', id] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['userBets', id] })
    }
  })

  const withdrawBetMutation = useMutation({
    mutationFn: async (betId: string) => {
      console.log(`🔄 Withdrawing bet: ${betId}`)
      const response = await fetch(`/api/markets/${id}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betId })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to withdraw bet')
      }
      return response.json()
    },
    onSuccess: (data) => {
      console.log('✅ Withdrawal successful:', data)
      queryClient.invalidateQueries({ queryKey: ['market', id] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      refetchUserBets()
    },
    onError: (error) => {
      console.error('Withdraw mutation error:', error)
    }
  })

  // Use the imported formatOdds from utils

  const formatTimeUntil = (date: string | Date) => {
    if (!date) return 'Invalid date'
    
    try {
      const now = new Date()
      const target = typeof date === 'string' ? new Date(date) : date
      
      // Validate date
      if (!(target instanceof Date) || isNaN(target.getTime())) {
        console.error('Invalid date:', date)
        return 'Invalid date'
      }
      
      const diffMs = target.getTime() - now.getTime()
      
      if (diffMs <= 0) return 'Closed'
      
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      if (days > 0) return `${days}d ${hours}h`
      if (hours > 0) return `${hours}h ${minutes}m`
      if (minutes > 0) return `${minutes}m`
      return 'Less than 1m'
    } catch (error) {
      console.error('Error formatting time:', error)
      return 'Invalid date'
    }
  }

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'No date'
    
    try {
      const target = typeof date === 'string' ? new Date(date) : date
      
      // Validate date
      if (!(target instanceof Date) || isNaN(target.getTime())) {
        console.error('Invalid date:', date)
        return 'Invalid date'
      }
      
      return target.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }

  const handlePlaceBet = () => {
    if (!selectedSide || !betAmount || !user) return
    
    const amount = parseInt(betAmount)
    if (amount <= 0 || amount > user.pointsBalance) return
    
    placeBetMutation.mutate({ side: selectedSide, amount })
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>
            {error.message || 'Market not found'}
            <br />
            <button 
              onClick={() => window.location.href = '/app'}
              className="mt-2 text-sm underline"
            >
              Back to Markets
            </button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!market) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Market not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  const totalVolume = market.yesPool + market.noPool

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Market Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-green-100 text-green-800">
                  {market.status}
                </Badge>
                {market.category && (
                  <Badge variant="outline">{market.category}</Badge>
                )}
              </div>
              
              <CardTitle className="text-2xl leading-tight mb-3">
                {market.question}
              </CardTitle>
              
              {market.description && (
                <p className="text-muted-foreground mb-4">
                  {market.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Closes {formatTimeUntil(market.closesAt)}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {(totalVolume || 0).toLocaleString()} points wagered
                </div>
              </div>
            </div>
            
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
              {market.image ? (
                <img 
                  src={market.image} 
                  alt={market.question} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    // Show a simple fallback instead
                    const parent = target.parentElement
                    if (parent && !parent.querySelector('.fallback-icon')) {
                      parent.innerHTML = '<div class="fallback-icon text-gray-400 text-3xl font-bold">?</div>'
                    }
                  }}
                />
              ) : (
                <div className="text-gray-400 text-3xl font-bold">
                  {market.category?.charAt(0) || '?'}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Betting Interface */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Place Your Bet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Odds */}
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedSide === 'YES' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => setSelectedSide('YES')}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">YES</div>
                    <div className="text-lg font-semibold">{formatOdds(market.yesPool || 0, market.noPool || 0).yes}%</div>
                    <div className="text-sm text-muted-foreground">{(market.yesPool || 0).toLocaleString()} points</div>
                  </div>
                </div>
                
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedSide === 'NO' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
                  }`}
                  onClick={() => setSelectedSide('NO')}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">NO</div>
                    <div className="text-lg font-semibold">{formatOdds(market.yesPool || 0, market.noPool || 0).no}%</div>
                    <div className="text-sm text-muted-foreground">{(market.noPool || 0).toLocaleString()} points</div>
                  </div>
                </div>
              </div>

              {/* Bet Amount */}
              {selectedSide && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Bet Amount (Your balance: {user?.pointsBalance?.toLocaleString() || 0} points)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      min="1"
                      max={user?.pointsBalance || 0}
                    />
                  </div>
                  
                  {betAmount && selectedSide && market && (
                    (() => {
                      const amount = Math.max(0, Number(betAmount) || 0)
                      if (amount <= 0) return null
                      
                      const earnings = calculatePotentialEarnings(
                        amount,
                        selectedSide,
                        market.yesPool,
                        market.noPool
                      )
                      
                      return (
                        <div className="p-3 bg-muted rounded-lg space-y-2">
                          <div className="text-sm">
                            <div>Betting <strong>{amount.toLocaleString()} points</strong> on <strong className={selectedSide === 'YES' ? 'text-green-600' : 'text-red-600'}>{selectedSide}</strong></div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="font-medium text-green-600">
                                +{earnings.potentialEarnings.toLocaleString()} points
                              </div>
                              <div className="text-muted-foreground text-xs">
                                Potential profit
                              </div>
                            </div>
                            
                            <div>
                              <div className="font-medium">
                                {earnings.impliedOdds}%
                              </div>
                              <div className="text-muted-foreground text-xs">
                                Market probability
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground border-t pt-2">
                            You need {earnings.breakEvenPoint}% confidence to break even
                          </div>
                        </div>
                      )
                    })()
                  )}
                  
                  <Button 
                    onClick={handlePlaceBet}
                    disabled={!betAmount || placeBetMutation.isPending || !user || parseInt(betAmount || '0') > user.pointsBalance}
                    className="w-full"
                  >
                    {placeBetMutation.isPending ? 'Placing Bet...' : `Bet ${betAmount} points on ${selectedSide}`}
                  </Button>
                  
                  {placeBetMutation.error && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {placeBetMutation.error.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User's Bets & Withdrawal */}
        {userBets?.bets && userBets.bets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Bets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userBets.bets.map((bet: any) => (
                <div key={bet.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-semibold">
                      {bet.amount.toLocaleString()} pts on <span className={bet.side === 'YES' ? 'text-green-600' : 'text-red-600'}>{bet.side}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(bet.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {market.status === 'OPEN' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => withdrawBetMutation.mutate(bet.id)}
                      disabled={withdrawBetMutation.isPending}
                    >
                      {withdrawBetMutation.isPending ? 'Withdrawing...' : 'Withdraw'}
                    </Button>
                  )}
                </div>
              ))}
              
              {withdrawBetMutation.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {withdrawBetMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}
              
              {market.status === 'OPEN' && (
                <div className="text-xs text-muted-foreground">
                  ⚠️ Withdrawing bets incurs penalties based on current odds and time remaining
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Market Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Volume</span>
                        <span className="font-semibold">{(totalVolume || 0).toLocaleString()} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">YES Pool</span>
                <span className="font-semibold text-green-600">{(market.yesPool || 0).toLocaleString()} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">NO Pool</span>
                <span className="font-semibold text-red-600">{(market.noPool || 0).toLocaleString()} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-semibold">{formatDate(market.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Closes</span>
                <span className="font-semibold">{formatDate(market.closesAt)}</span>
              </div>
            </CardContent>
          </Card>

          {market.status === 'OPEN' && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This market is live! Place your bet before it closes.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
