'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button } from './ui/button'

type User = {
  id: string
  walletAddress: string
  role: string
  pointsBalance: number
  creditedInitial: boolean
}

// Dynamic import to prevent hydration issues
const WalletButton = dynamic(() => import('./wallet-button').then(mod => ({ default: mod.WalletButton })), {
  ssr: false,
  loading: () => <div className="h-10 w-32 bg-primary rounded-lg animate-pulse" />
})

export function WalletConnect() {
  const { connected, publicKey } = useWallet()
  const queryClient = useQueryClient()
  const [mounted, setMounted] = useState(false)
  const [attemptedAuth, setAttemptedAuth] = useState<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: user, refetch: refetchUser } = useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<User> => {
      console.log('Fetching user data...')
      const response = await fetch('/api/me', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      
      console.log('User response status:', response.status)
      
      if (!response.ok) {
        console.log('User fetch failed:', response.status)
        throw new Error('Not authenticated')
      }
      
      const userData = await response.json()
      console.log('User data received:', userData.walletAddress?.slice(0, 8) + '...')
      return userData
    },
    enabled: connected && mounted,
    retry: false,
    refetchOnWindowFocus: false
  })

  const authMutation = useMutation({
    mutationFn: async () => {
      console.log('Simple auth for wallet:', publicKey!.toString().slice(0, 8) + '...')
      
      // Simple authentication - just send wallet address
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          walletAddress: publicKey!.toString()
        })
      })
      
      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json()
        console.log('Auth failed:', errorData)
        throw new Error(errorData.error || 'Authentication failed')
      }
      
      console.log('Auth successful!')
      return verifyResponse.json()
    },
    onSuccess: (data) => {
      console.log('Auth success:', data)
      setAttemptedAuth(null) // Clear attempted auth flag on success
      setTimeout(() => { // Small delay for cookie to set
        queryClient.invalidateQueries({ queryKey: ['user'] })
        setIsAuthenticating(false)
      }, 500)
    },
    onError: (error) => {
      console.error('Auth error:', error)
      setIsAuthenticating(false)
      // Don't clear attemptedAuth on error to prevent immediate retry
    }
  })

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (
      connected &&
      !user &&
      !isAuthenticating &&
      !authMutation.isPending &&
      publicKey &&
      attemptedAuth !== publicKey.toString() // Prevent re-attempt for same wallet
    ) {
      console.log('Starting authentication for wallet:', publicKey.toString().slice(0, 8) + '...')
      setAttemptedAuth(publicKey.toString())
      setIsAuthenticating(true)
      authMutation.mutate()
    }
  }, [connected, user, isAuthenticating, authMutation.isPending, publicKey, attemptedAuth])

  if (!mounted) {
    return <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
  }

  if (!connected) {
    return <WalletButton />
  }

  if (isAuthenticating || authMutation.isPending) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-10 w-32 bg-primary/50 rounded-lg animate-pulse" />
        <span className="text-sm text-muted-foreground">Authenticating...</span>
      </div>
    )
  }

  if (!user) {
    // If connected but no user, show Sign In button
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={() => {
            setAttemptedAuth(null) // Reset attempt flag for manual retry
            setIsAuthenticating(true)
            authMutation.mutate()
          }}
          disabled={authMutation.isPending || isAuthenticating}
        >
          {authMutation.isPending || isAuthenticating ? 'Authenticating...' : 'Sign In'}
        </Button>
        <span className="text-xs text-muted-foreground">
          {attemptedAuth ? 'Click to retry authentication' : 'Click to authenticate'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm">
        <div className="font-medium text-foreground">
          {user.walletAddress.slice(0, 4)}...{user.walletAddress.slice(-4)}
        </div>
        <div className="text-xs text-muted-foreground">
          {user.pointsBalance.toLocaleString()} points
        </div>
      </div>
      <WalletButton />
    </div>
  )
}