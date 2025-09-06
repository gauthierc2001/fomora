'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPoints } from '@/lib/utils'
import { Download, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface Market {
  id: string
  question: string
  status: 'OPEN' | 'CLOSED' | 'RESOLVED' | 'CANCELLED'
  yesPool: number
  noPool: number
  closesAt: string
  createdAt: string
  resolution?: 'YES' | 'NO' | 'CANCELLED'
  _count: { bets: number }
}

export default function AdminPage() {
  const queryClient = useQueryClient()
  const [resolutionData, setResolutionData] = useState<{
    marketId: string
    resolution: 'YES' | 'NO' | 'CANCELLED'
    evidenceUrl: string
    note: string
  } | null>(null)

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/me')
      if (!response.ok) throw new Error('Not authenticated')
      return response.json()
    }
  })

  const { data: markets, isLoading } = useQuery({
    queryKey: ['admin-markets'],
    queryFn: async (): Promise<{ markets: Market[] }> => {
      const response = await fetch('/api/markets?limit=50')
      if (!response.ok) throw new Error('Failed to fetch markets')
      return response.json()
    },
    enabled: user?.role === 'ADMIN'
  })

  const resolveMutation = useMutation({
    mutationFn: async (data: {
      marketId: string
      resolution: 'YES' | 'NO' | 'CANCELLED'
      evidenceUrl?: string
      note?: string
    }) => {
      const response = await fetch(`/api/admin/markets/${data.marketId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolution: data.resolution,
          evidenceUrl: data.evidenceUrl,
          note: data.note
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to resolve market')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-markets'] })
      setResolutionData(null)
    }
  })

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/export/airdrop')
      if (!response.ok) throw new Error('Failed to export data')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `fomora-airdrop-eligibility-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      return true
    }
  })

  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h1 className="text-2xl font-heading font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground">Admin access required</p>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'OPEN':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage markets and export data</p>
        </div>
        
        <Button
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {exportMutation.isPending ? 'Exporting...' : 'Export Airdrop CSV'}
        </Button>
      </div>

      {/* Markets Management */}
      <Card>
        <CardHeader>
          <CardTitle>Markets Management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading markets...</div>
          ) : (
            <div className="space-y-4">
              {markets?.markets.map((market) => (
                <div key={market.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(market.status)}
                        <Badge variant={market.status === 'RESOLVED' ? 'default' : 'secondary'}>
                          {market.status}
                        </Badge>
                        {market.resolution && (
                          <Badge variant="outline">
                            Resolved: {market.resolution}
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-medium mb-2">{market.question}</h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">YES Pool:</span>
                          <div className="font-medium">{formatPoints(market.yesPool)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">NO Pool:</span>
                          <div className="font-medium">{formatPoints(market.noPool)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Bets:</span>
                          <div className="font-medium">{market._count.bets}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Closes:</span>
                          <div className="font-medium">
                            {new Date(market.closesAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {market.status !== 'RESOLVED' && market.status !== 'CANCELLED' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setResolutionData({
                            marketId: market.id,
                            resolution: 'YES',
                            evidenceUrl: '',
                            note: ''
                          })}
                        >
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolution Modal */}
      {resolutionData && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Resolve Market</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Resolution</Label>
              <div className="flex gap-2 mt-2">
                {(['YES', 'NO', 'CANCELLED'] as const).map((option) => (
                  <Button
                    key={option}
                    size="sm"
                    variant={resolutionData.resolution === option ? 'default' : 'outline'}
                    onClick={() => setResolutionData(prev => 
                      prev ? { ...prev, resolution: option } : null
                    )}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="evidenceUrl">Evidence URL (Optional)</Label>
              <Input
                id="evidenceUrl"
                placeholder="https://twitter.com/... or other proof"
                value={resolutionData.evidenceUrl}
                onChange={(e) => setResolutionData(prev => 
                  prev ? { ...prev, evidenceUrl: e.target.value } : null
                )}
              />
            </div>
            
            <div>
              <Label htmlFor="note">Admin Note (Optional)</Label>
              <Input
                id="note"
                placeholder="Resolution reasoning or additional context"
                value={resolutionData.note}
                onChange={(e) => setResolutionData(prev => 
                  prev ? { ...prev, note: e.target.value } : null
                )}
              />
            </div>
            
            {resolveMutation.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {resolveMutation.error.message}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-3">
              <Button
                onClick={() => setResolutionData(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => resolveMutation.mutate(resolutionData)}
                disabled={resolveMutation.isPending}
              >
                {resolveMutation.isPending ? 'Resolving...' : 'Confirm Resolution'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
