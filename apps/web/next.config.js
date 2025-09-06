/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  transpilePackages: ['@fomora/db'],
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com']
  },
  env: {
    NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'
  }
}

module.exports = nextConfig
