'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CalendarDays, Coins } from 'lucide-react'

const createMarketSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters').max(200),
  description: z.string().min(10, 'Description is required and must be at least 10 characters'),
  category: z.string().max(50).optional(),
  closesAt: z.string().refine((date) => {
    const selectedDate = new Date(date)
    const now = new Date()
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return selectedDate > now && selectedDate <= oneWeekFromNow
  }, 'Must be in the future and no more than 1 week from now'),
  image: z.string().url('Please provide a valid image URL')
})

type CreateMarketForm = z.infer<typeof createMarketSchema>

export default function CreateMarketPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [preview, setPreview] = useState(false)

  const { data: config } = useQuery({
    queryKey: ['test-config'],
    queryFn: async () => {
      const response = await fetch('/api/config')
      if (!response.ok) throw new Error('Failed to fetch config')
      return response.json()
    }
  })

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/me')
      if (!response.ok) throw new Error('Not authenticated')
      return response.json()
    }
  })

  const { data: userMarkets } = useQuery({
    queryKey: ['user-markets'],
    queryFn: async () => {
      const response = await fetch('/api/markets?limit=100')
      if (!response.ok) throw new Error('Failed to fetch markets')
      const data = await response.json()
      return data.markets.filter((m: any) => m.createdBy !== 'system')
    }
  })

  const form = useForm<CreateMarketForm>({
    resolver: zodResolver(createMarketSchema),
    defaultValues: {
      category: 'Social Media',
      closesAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    }
  })

  const createMarketMutation = useMutation({
    mutationFn: async (data: CreateMarketForm) => {
      const response = await fetch('/api/markets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create market')
      }
      
      return response.json()
    },
    onSuccess: (market) => {
      queryClient.invalidateQueries({ queryKey: ['markets'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      router.push(`/app/market/${market.id}`)
    }
  })

  const onSubmit = (data: CreateMarketForm) => {
    createMarketMutation.mutate(data)
  }

  const watchedValues = form.watch()

  // Allow markets to close up to 1 week from now
  const maxCloseTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Create Prediction Market</h1>
        <p className="text-muted-foreground">
          Create a market for others to predict viral content outcomes
        </p>
        {userMarkets && userMarkets.length >= 3 && (
          <Alert variant="destructive">
            <AlertDescription>
              You have reached the maximum of 3 markets per user. You cannot create more markets.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Market Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  placeholder="Will 'crypto winter' trend on X by Sunday?"
                  {...form.register('question')}
                />
                {form.formState.errors.question && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.question.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description (Required)</Label>
                <Input
                  id="description"
                  placeholder="Additional details or resolution criteria (minimum 10 characters)"
                  {...form.register('description')}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="image">Market Image URL (Required)</Label>
                <Input
                  id="image"
                  placeholder="https://example.com/image.jpg"
                  {...form.register('image')}
                />
                {form.formState.errors.image && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.image.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Provide a relevant image URL for your market
                </p>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  {...form.register('category')}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="Social Media">Social Media</option>
                  <option value="Crypto">Crypto</option>
                  <option value="NFT">NFT</option>
                  <option value="Tech">Tech</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </div>

              <div>
                <Label htmlFor="closesAt">Closes At</Label>
                <Input
                  id="closesAt"
                  type="datetime-local"
                  max={maxCloseTime}
                  {...form.register('closesAt')}
                />
                {form.formState.errors.closesAt && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.closesAt.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum 1 week from now
                </p>
              </div>

              <Alert>
                <Coins className="h-4 w-4" />
                <AlertDescription>
                  Creating a market costs <strong>100 points</strong>. 
                  You currently have <strong>{user?.pointsBalance || 0} points</strong>.
                  <br />
                  Markets created: <strong>{user?.marketsCreated || 0}/3 maximum</strong>
                </AlertDescription>
              </Alert>

              {createMarketMutation.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {createMarketMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreview(!preview)}
                  disabled={!watchedValues.question}
                >
                  {preview ? 'Edit' : 'Preview'}
                </Button>
                
                <Button
                  type="submit"
                  disabled={createMarketMutation.isPending || !user || user.pointsBalance < 100 || (userMarkets && userMarkets.length >= 3)}
                >
                  {createMarketMutation.isPending ? 'Creating...' : 'Create Market (100 pts)'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {watchedValues.question ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge>OPEN</Badge>
                  {watchedValues.category && (
                    <Badge variant="outline">{watchedValues.category}</Badge>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg leading-tight">
                  {watchedValues.question}
                </h3>
                
                {watchedValues.description && (
                  <p className="text-sm text-muted-foreground">
                    {watchedValues.description}
                  </p>
                )}

                {watchedValues.image && (
                  <div className="w-full h-32 border rounded-lg overflow-hidden">
                    <img 
                      src={watchedValues.image} 
                      alt="Market preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24"%3E%3Cpath fill="%23ccc" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  {watchedValues.closesAt && (
                    <span>
                      Closes {new Date(watchedValues.closesAt).toLocaleString()}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium text-green-600">YES 50%</div>
                    <div className="text-xs text-muted-foreground">0 points</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-medium text-red-600">NO 50%</div>
                    <div className="text-xs text-muted-foreground">0 points</div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Enter a question to see preview
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
