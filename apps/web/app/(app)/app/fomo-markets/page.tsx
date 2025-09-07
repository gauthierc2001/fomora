'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { formatPoints, formatOdds } from '@/lib/utils'
import { Search, TrendingUp, Clock, Users, Flame } from 'lucide-react'

interface Market {
  id: string
  question: string
  description?: string
  category?: string
  status: 'OPEN' | 'CLOSED' | 'RESOLVED' | 'CANCELLED'
  closesAt: string
  yesPool: number
  noPool: number
  creator: { walletAddress: string }
  _count: { bets: number }
}

interface MarketsResponse {
  markets: Market[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function FomoMarketsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [hasInitialized, setHasInitialized] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['fomo-markets', { search, category, page }],
    queryFn: async (): Promise<MarketsResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(category && { category })
      })
      
      const response = await fetch(`/api/fomo-markets?${params}`)
      if (!response.ok) throw new Error('Failed to fetch FOMO markets')
      const result = await response.json()
      
      // If no FOMO markets exist globally and we haven't tried to initialize, do it automatically
      // Only check when not filtering (no search, no category, first page)
      if (result.markets.length === 0 && result.pagination.total === 0 && !hasInitialized && !search && !category && page === 1) {
        console.log('No FOMO markets found globally, auto-populating...')
        try {
          const initResponse = await fetch('/api/init-fomo-markets', { method: 'POST' })
          if (initResponse.ok) {
            setHasInitialized(true)
            // Refetch markets after initialization
            setTimeout(() => refetch(), 1500)
          }
        } catch (error) {
          console.error('Failed to auto-populate FOMO markets:', error)
        }
      }
      
      return result
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-yellow-100 text-yellow-800'
      case 'RESOLVED': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimeUntil = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    
    if (diff <= 0) return 'Closed'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }
    
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
            <Flame className="h-8 w-8 text-orange-500" />
            FOMO Markets
          </h1>
          <p className="text-muted-foreground">
            Fast-paced markets for viral moments and peak FOMO
          </p>
        </div>
        
        <Button asChild>
          <Link href="/app/create">Create Market</Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FOMO markets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="">All FOMO Categories</option>
              <option value="FOMO">🔥 Pure FOMO</option>
              <option value="Viral">📈 Viral</option>
              <option value="Hype">🚀 Hype</option>
              <option value="Trending">📊 Trending</option>
              <option value="Buzz">⚡ Buzz</option>
              <option value="Meta">🤯 Meta</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Markets List */}
      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {data?.markets.map((market) => {
            const odds = formatOdds(market.yesPool, market.noPool)
            const totalVolume = market.yesPool + market.noPool
            
            return (
              <Card key={market.id} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-400">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(market.status)}>
                            {market.status}
                          </Badge>
                          {market.category && (
                            <Badge variant="outline" className="border-orange-300 text-orange-700">
                              <Flame className="h-3 w-3 mr-1" />
                              {market.category}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg leading-tight">
                          {market.question}
                        </CardTitle>
                        {market.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {market.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeUntil(market.closesAt)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-green-600">
                        YES {odds.yes}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPoints(market.yesPool)} points
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-red-600">
                        NO {odds.no}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPoints(market.noPool)} points
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {formatPoints(totalVolume)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Volume
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {market._count.bets}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Bets Placed
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      Created by {market.creator?.walletAddress === 'FOMO System' ? 'FOMO System' : market.creator?.walletAddress ? `${market.creator.walletAddress.slice(0, 4)}...${market.creator.walletAddress.slice(-4)}` : 'System'}
                    </div>
                    
                    <Button variant="outline" size="sm" asChild className="border-orange-300 hover:bg-orange-50">
                      <Link href={`/app/market/${market.id}`}>
                        View Market
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          
          {data?.markets.length === 0 && (
            <Card className="border-orange-200">
              <CardContent className="pt-8 pb-8 text-center">
                <Flame className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No FOMO markets found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  FOMO markets are fast-paced and time-sensitive!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          
          <span className="px-4 py-2 text-sm">
            Page {page} of {data.pagination.pages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === data.pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
