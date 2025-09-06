'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Trophy, Medal, Award, User, TrendingUp, Target, DollarSign, Search } from 'lucide-react'

interface LeaderboardUser {
  id: string
  walletAddress: string
  fullWalletAddress?: string
  displayName?: string
  profilePicture?: string
  pointsBalance: number
  totalBets: number
  totalWagered: number
  marketsCreated: number
  createdAt: string
  rank: number
}

interface LeaderboardResponse {
  leaderboard: LeaderboardUser[]
  userRank: number | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data, isLoading, error } = useQuery<LeaderboardResponse>({
    queryKey: ['leaderboard', searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: '50',
        ...(searchQuery && { search: searchQuery })
      })
      const response = await fetch(`/api/leaderboard?${params}`)
      if (!response.ok) throw new Error('Failed to fetch leaderboard')
      return response.json()
    }
  })

  // Filter leaderboard locally for real-time search
  const filteredLeaderboard = data?.leaderboard.filter(user => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      user.displayName?.toLowerCase().includes(query) ||
      user.fullWalletAddress?.toLowerCase().includes(query) ||
      user.walletAddress.toLowerCase().includes(query)
    )
  }) || []

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
  }

  const getRankBadgeVariant = (rank: number) => {
    if (rank === 1) return "default"
    if (rank === 2) return "secondary" 
    if (rank === 3) return "outline"
    return "outline"
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Leaderboard Unavailable</h2>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Unable to load leaderboard data'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          Leaderboard
        </h1>
        
        {data?.userRank && (
          <Badge variant="outline" className="text-sm">
            Your Rank: #{data.userRank}
          </Badge>
        )}
      </div>

      {/* Search Bar */}
      <div className="max-w-md relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or wallet address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Top 3 Podium */}
      {filteredLeaderboard.length >= 3 && !searchQuery && (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Second Place */}
          <Card className="md:order-1 border-gray-300">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-3">
                  {data.leaderboard[1]?.profilePicture ? (
                    <img
                      src={data.leaderboard[1].profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <Medal className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <Badge variant="secondary" className="mb-2">#2</Badge>
              </div>
              <h3 className="font-semibold mb-1">
                {data.leaderboard[1]?.displayName || data.leaderboard[1]?.walletAddress}
              </h3>
              <p className="text-2xl font-bold text-primary mb-2">
                {data.leaderboard[1]?.pointsBalance.toLocaleString()} pts
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>{data.leaderboard[1]?.totalBets} bets</div>
                <div>{data.leaderboard[1]?.totalWagered.toLocaleString()} wagered</div>
              </div>
            </CardContent>
          </Card>

          {/* First Place */}
          <Card className="md:order-2 border-yellow-300 bg-gradient-to-b from-yellow-50 to-white">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-yellow-100 flex items-center justify-center overflow-hidden mb-3 ring-4 ring-yellow-200">
                  {data.leaderboard[0]?.profilePicture ? (
                    <img
                      src={data.leaderboard[0].profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-yellow-600" />
                  )}
                </div>
                <Trophy className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                <Badge className="mb-2 bg-yellow-500 hover:bg-yellow-600">#1 Champion</Badge>
              </div>
              <h3 className="font-bold text-lg mb-1">
                {data.leaderboard[0]?.displayName || data.leaderboard[0]?.walletAddress}
              </h3>
              <p className="text-3xl font-bold text-primary mb-2">
                {data.leaderboard[0]?.pointsBalance.toLocaleString()} pts
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>{data.leaderboard[0]?.totalBets} bets</div>
                <div>{data.leaderboard[0]?.totalWagered.toLocaleString()} wagered</div>
              </div>
            </CardContent>
          </Card>

          {/* Third Place */}
          <Card className="md:order-3 border-amber-300">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center overflow-hidden mb-3">
                  {data.leaderboard[2]?.profilePicture ? (
                    <img
                      src={data.leaderboard[2].profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-amber-600" />
                  )}
                </div>
                <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <Badge variant="outline" className="mb-2 border-amber-300">#3</Badge>
              </div>
              <h3 className="font-semibold mb-1">
                {data.leaderboard[2]?.displayName || data.leaderboard[2]?.walletAddress}
              </h3>
              <p className="text-2xl font-bold text-primary mb-2">
                {data.leaderboard[2]?.pointsBalance.toLocaleString()} pts
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>{data.leaderboard[2]?.totalBets} bets</div>
                <div>{data.leaderboard[2]?.totalWagered.toLocaleString()} wagered</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Full Rankings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {filteredLeaderboard.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                  index < 3 ? 'bg-muted/30' : ''
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(user.rank)}
                </div>

                {/* Profile Picture */}
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {user.displayName || user.walletAddress}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.walletAddress}
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {user.totalBets}
                    </div>
                    <div className="text-xs text-muted-foreground">Bets</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {user.totalWagered.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Wagered</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {user.marketsCreated}
                    </div>
                    <div className="text-xs text-muted-foreground">Created</div>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {user.pointsBalance.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            ))}
          </div>

          {filteredLeaderboard.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery ? 'No users match your search.' : 'No users found. Be the first to join the competition!'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Info */}
      {data.pagination && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {data.leaderboard.length} of {data.pagination.total} users
        </div>
      )}
    </div>
  )
}
