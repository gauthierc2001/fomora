'use client'

import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Check if it's a wallet extension error that we can ignore
    if (
      error.message?.includes('disconnected port object') ||
      error.message?.includes('Extension context invalidated') ||
      error.message?.includes('chrome-extension')
    ) {
      console.warn('Wallet extension error (non-critical):', error.message)
      return { hasError: false } // Don't show error for wallet extension issues
    }
    
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log critical errors only
    if (!error.message?.includes('disconnected port object')) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Something went wrong. Please refresh the page.
              <br />
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm underline"
              >
                Refresh Page
              </button>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}
