'use client'

import { ReactQueryProvider } from '@/lib/query-client'
import { SolanaWalletProvider } from '@/lib/wallet'
import { ThemeProvider } from 'next-themes'
import { ErrorBoundary } from '@/components/error-boundary'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <ReactQueryProvider>
          <SolanaWalletProvider>
            {children}
          </SolanaWalletProvider>
        </ReactQueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
