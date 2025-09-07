'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Activity, TrendingUp, Clock, DollarSign, Target } from 'lucide-react'

export default function ActivityPage() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/me')
      if (!response.ok) throw new Error('Not authenticated')
      return response.json()
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchIntervalInBackground: true
  })

  const { data: userMarkets } = useQuery({
    queryKey: ['user-markets'],
    queryFn: async () => {
      const response = await fetch('/api/markets?limit=100')
      if (!response.ok) throw new Error('Failed to fetch markets')
      const data = await response.json()
      return data.markets
        .filter((m: any) => m.createdBy !== 'system')
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  })

  const { data: userBetsData } = useQuery({
    queryKey: ['user-bets'],
    queryFn: async () => {
      const response = await fetch('/api/user-bets')
      if (!response.ok) throw new Error('Failed to fetch user bets')
      const data = await response.json()
      return {
        ...data,
        bets: (data.bets || []).sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      }
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  })

  const userBets = userBetsData?.bets || []

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">My Activity</h1>
        <p className="text-muted-foreground">
          Your betting history, created markets and platform activity
        </p>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{user?.pointsBalance?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Points Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{user?.totalBets || 0}</p>
                <p className="text-xs text-muted-foreground">Total Bets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{user?.marketsCreated || 0}</p>
                <p className="text-xs text-muted-foreground">Markets Created</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{user?.totalWagered?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Points Wagered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Bets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Bets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userBets && userBets.length > 0 ? (
              <div className="space-y-4">
                {userBets.map((bet: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{bet.marketQuestion}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={bet.side === 'YES' ? 'default' : 'secondary'}>
                          {bet.side}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {bet.amount} points
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(bet.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  No bets yet. Start by betting on prediction markets!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Created Markets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              My Markets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userMarkets && userMarkets.length > 0 ? (
              <div className="space-y-4">
                {userMarkets.slice(0, 5).map((market: any) => (
                  <div key={market.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm leading-tight">
                          {market.question}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-green-100 text-green-800">
                            {market.status}
                          </Badge>
                          {market.category && (
                            <Badge variant="outline">
                              {market.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(market.createdAt)}
                        </div>
                        <div className="mt-1">
                          {(market.yesPool + market.noPool).toLocaleString()} points
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {userMarkets.length > 5 && (
                  <p className="text-center text-sm text-muted-foreground">
                    And {userMarkets.length - 5} more markets...
                  </p>
                )}
              </div>
            ) : (
              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  No markets created yet. You can create up to 3 markets.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
