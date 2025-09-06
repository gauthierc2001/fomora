'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { Logo } from '@/components/logo'
import { TestTimer } from '@/components/test-timer'
import { WalletConnect } from '@/components/wallet-connect'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Markets', href: '/app' },
  { name: 'FOMO Markets', href: '/app/fomo-markets' },
  { name: 'Create', href: '/app/create' },
  { name: 'Leaderboard', href: '/app/leaderboard' },
  { name: 'Profile', href: '/app/profile' },
  { name: 'My Activity', href: '/app/activity' },
  { name: 'Rules', href: '/app/rules' },
]

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { connected } = useWallet()
  const pathname = usePathname()

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/me')
      if (!response.ok) throw new Error('Not authenticated')
      return response.json()
    },
    enabled: connected,
    retry: false
  })

  return (
    <div className="min-h-screen bg-fomora-gray">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <Logo />
              </Link>
              <TestTimer />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <a 
                  href="https://x.com/tryfomora" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Follow Us</span>
                </a>
              </Button>
              <WalletConnect />
            </div>
          </div>
          
          {/* Navigation */}
          {connected && user && (
            <nav className="flex space-x-1 border-t py-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href === '/app' && pathname === '/app') ||
                  (item.href === '/app/fomo-markets' && pathname === '/app/fomo-markets')
                
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link href={item.href}>{item.name}</Link>
                  </Button>
                )
              })}
              
              {user.role === 'ADMIN' && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/app/admin">Admin</Link>
                </Button>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!connected ? (
          <div className="max-w-md mx-auto text-center py-20">
            <h1 className="text-2xl font-heading font-bold mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-muted-foreground mb-8">
              Connect a Solana wallet to start predicting what goes viral
            </p>
            <WalletConnect />
          </div>
        ) : !user ? (
          <div className="max-w-md mx-auto text-center py-20">
            <h1 className="text-2xl font-heading font-bold mb-4">
              Authenticating...
            </h1>
            <p className="text-muted-foreground">
              Connecting your wallet to the platform
            </p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  )
}
