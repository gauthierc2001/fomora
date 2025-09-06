'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Camera, Trophy, TrendingUp, Target, Coins } from 'lucide-react'

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const [displayName, setDisplayName] = useState('')
  const [profilePicture, setProfilePicture] = useState('')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await fetch('/api/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      return response.json()
    }
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { displayName?: string; profilePicture?: string }) => {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
    }
  })


  // Initialize form when profile loads
  if (profile && displayName === '' && profilePicture === '') {
    setDisplayName(profile.displayName || '')
    setProfilePicture(profile.profilePicture || '')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate({
      displayName: displayName.trim() || undefined,
      profilePicture: profilePicture.trim() || undefined
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-heading font-bold">Profile Settings</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customize Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  maxLength={30}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {displayName.length}/30 characters
                </p>
              </div>

              <div>
                <Label htmlFor="profilePicture">Profile Picture URL</Label>
                <Input
                  id="profilePicture"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  type="url"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a URL to an image for your profile picture
                </p>
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <User className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      {displayName || 'Display Name'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {profile?.walletAddress?.slice(0, 4)}...{profile?.walletAddress?.slice(-4)}
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={updateProfileMutation.isPending}
                className="w-full"
              >
                {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
              </Button>

              {updateProfileMutation.error && (
                <p className="text-sm text-destructive">
                  {updateProfileMutation.error.message}
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Profile Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {profile?.pointsBalance?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-muted-foreground">Points</div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {profile?.totalBets || 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Bets</div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {profile?.totalWagered?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Wagered</div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {profile?.marketsCreated || 0}
                </div>
                <div className="text-xs text-muted-foreground">Markets Created</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Member since:</span>
                <span>
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions (visible to all users in demo) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Demo Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Coins className="h-4 w-4" />
              <AlertDescription>
                You can create up to 3 custom prediction markets. Each market requires a question, description, image URL, and costs 100 points.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
