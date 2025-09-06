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
    retryDelay: 1000 // Wait 1 second between retries
  })

  const { data: user } = useQuery({
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
    onSuccess: (data) => {
      console.log('Bet mutation success, invalidating queries...')
      queryClient.invalidateQueries({ queryKey: ['market', id] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      refetchUserBets()
      setBetAmount('')
      setSelectedSide(null)
    },
    onError: (error) => {
      console.error('Bet mutation error:', error)
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

  const formatOdds = (yesPool: number, noPool: number, side: 'YES' | 'NO') => {
    const total = yesPool + noPool
    if (total === 0) return '50%'
    const probability = side === 'YES' ? yesPool / total : noPool / total
    return `${Math.round(probability * 100)}%`
  }

  const formatTimeUntil = (date: string) => {
    const now = new Date()
    const target = new Date(date)
    const diffMs = target.getTime() - now.getTime()
    
    if (diffMs <= 0) return 'Closed'
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
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
                  {totalVolume.toLocaleString()} points wagered
                </div>
              </div>
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
                    <div className="text-lg font-semibold">{formatOdds(market.yesPool, market.noPool, 'YES')}</div>
                    <div className="text-sm text-muted-foreground">{market.yesPool.toLocaleString()} points</div>
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
                    <div className="text-lg font-semibold">{formatOdds(market.yesPool, market.noPool, 'NO')}</div>
                    <div className="text-sm text-muted-foreground">{market.noPool.toLocaleString()} points</div>
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
                      const amount = parseInt(betAmount || '0')
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
                <span className="font-semibold">{totalVolume.toLocaleString()} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">YES Pool</span>
                <span className="font-semibold text-green-600">{market.yesPool.toLocaleString()} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">NO Pool</span>
                <span className="font-semibold text-red-600">{market.noPool.toLocaleString()} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-semibold">{new Date(market.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Closes</span>
                <span className="font-semibold">{new Date(market.closesAt).toLocaleDateString()}</span>
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
