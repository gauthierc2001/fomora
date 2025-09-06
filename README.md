# Fomora - Prediction Markets on Solana

A decentralized prediction market platform built with Next.js, Prisma, and Solana Web3.js.

## Features

- 🔮 **Prediction Markets**: Create and bet on outcome predictions
- 💰 **Solana Integration**: Connect your Solana wallet and use devnet SOL
- 🏆 **Leaderboard**: Compete with other users and track your performance
- ⚡ **Real-time Updates**: Live market updates and betting functionality
- 🎯 **Point System**: Earn points through successful predictions
- 👑 **Admin Panel**: Manage markets and user activities

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Blockchain**: Solana Web3.js, Wallet Adapter
- **Deployment**: Vercel
- **Package Manager**: pnpm
- **Monorepo**: Turborepo

## Project Structure

```
fomora/
├── apps/
│   └── web/                 # Next.js web application
│       ├── app/            # App router pages and API routes
│       ├── components/     # React components
│       ├── lib/           # Utility functions and configs
│       └── styles/        # Global styles
├── packages/
│   ├── config/            # ESLint config
│   └── db/               # Prisma schema and database utilities
└── scripts/              # Setup and utility scripts
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database (we recommend Supabase)
- Solana wallet (Phantom, Solflare, or Backpack)

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@host:5432/database"
JWT_SECRET="your-32-character-secret-key"
TEST_START_ISO="2025-01-15T12:00:00.000Z"
TEST_HOURS="48"
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
NEXTAUTH_URL="http://localhost:8000"
NEXT_PUBLIC_APP_URL="http://localhost:8000"
```

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fomora
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup database**
   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Access the application**
   Open http://localhost:8000 in your browser

## Deployment

### Vercel Deployment

1. **Push to GitHub** and connect your repository to Vercel

2. **Set environment variables** in Vercel dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `TEST_START_ISO`
   - `TEST_HOURS`
   - `NEXT_PUBLIC_SOLANA_NETWORK`

3. **Deploy**
   ```bash
   pnpm deploy
   ```

4. **Setup database** (after successful deployment):
   ```bash
   vercel env pull .env.local
   pnpm db:push
   pnpm db:seed
   ```

### Create Admin User

After deployment, create an admin user:
```bash
npx tsx scripts/setup-admin.ts YOUR_SOLANA_WALLET_ADDRESS
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push database schema
- `pnpm db:seed` - Seed test data
- `pnpm deploy` - Deploy to Vercel

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.