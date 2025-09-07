import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import '@/styles/globals.css'
import '@solana/wallet-adapter-react-ui/styles.css'
import '@/lib/console-filter' // Filter out wallet noise
import '@/lib/fomo-scheduler' // Initialize FOMO market rotation

export const metadata: Metadata = {
  title: 'Fomora - Bet on the Internet',
  description: '48-hour public test. Get 10,000 points. Predict what goes viral.',
  keywords: 'prediction market, memes, crypto, betting, solana',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.jpg',
  },
  openGraph: {
    title: 'Fomora - Bet on the Internet',
    description: '48-hour public test. Get 10,000 points. Predict what goes viral.',
    url: 'https://fomora.vercel.app',
    siteName: 'Fomora',
    images: [
      {
        url: '/logo.jpg',
        width: 400,
        height: 400,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fomora - Bet on the Internet',
    description: '48-hour public test. Get 10,000 points. Predict what goes viral.',
    images: ['/logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
