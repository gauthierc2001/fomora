# Fomora - Internet Meme Prediction Market

**Bet on the Internet** - A 48-hour public test prediction market for viral content outcomes.

## 🚀 Quick Start

```bash
# Clone and install
git clone <repository>
cd fomora
pnpm install

# Set up environment
cp env.example .env
# Edit .env with your Supabase DATABASE_URL and JWT_SECRET

# Database setup
pnpm db:push
pnpm db:seed

# Start development
pnpm dev
```

Access the app at `http://localhost:8000`

## 📋 Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase account for database
- Solana wallet (Phantom, Solflare, or Backpack) for testing

## 🏗️ Project Structure

```
fomora/
├── apps/web/                 # Next.js 14 web application
│   ├── app/                  # App Router pages
│   │   ├── (marketing)/      # Landing page
│   │   ├── (app)/           # Protected dApp routes
│   │   └── api/             # API routes
│   ├── components/          # React components
│   ├── lib/                 # Utilities and helpers
│   └── styles/              # Global styles
├── packages/
│   ├── db/                  # Prisma schema and client
│   └── config/              # Shared configuration
└── docs/                    # Documentation
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS
- **UI**: shadcn/ui components, Framer Motion
- **Solana**: @solana/wallet-adapter (devnet)
- **Backend**: Next.js API routes
- **Database**: Supabase Postgres with Prisma ORM
- **Auth**: Sign-In With Solana (SIWS)
- **State**: TanStack Query
- **Deployment**: Vercel + Supabase

## ⚙️ Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Database (Required)
DATABASE_URL="postgresql://user:pass@host:port/db"

# JWT Secret (Required) - Generate: openssl rand -base64 32
JWT_SECRET="your-32-character-secret"

# Test Window Configuration
TEST_START_ISO="2025-09-06T11:00:00.000Z"  # UTC time
TEST_HOURS="48"

# Solana Network
NEXT_PUBLIC_SOLANA_NETWORK="devnet"

# App URLs
NEXTAUTH_URL="http://localhost:8000"
NEXT_PUBLIC_APP_URL="http://localhost:8000"
```

## 🗄️ Database Setup

### Using Supabase (Recommended)

1. Create a [Supabase](https://supabase.io) project
2. Get your database URL from Project Settings > Database
3. Set `DATABASE_URL` in your `.env` file
4. Run migrations:

```bash
cd packages/db
pnpm db:push          # Create tables
pnpm db:seed          # Seed test data
```

### Local PostgreSQL

```bash
# Install PostgreSQL locally
createdb fomora
export DATABASE_URL="postgresql://username:password@localhost:5432/fomora"
pnpm db:push
pnpm db:seed
```

## 🏃‍♂️ Development

```bash
# Install dependencies
pnpm install

# Database operations
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema changes
pnpm db:migrate       # Create migration
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed test data

# Development server
pnpm dev              # Start all services
# OR
cd apps/web && pnpm dev --port 8000

# Build for production
pnpm build

# Linting and testing
pnpm lint
pnpm test
```

## 🎯 Core Features

### 🔗 Wallet Integration
- Connect Solana wallets (Phantom, Solflare, Backpack)
- Sign-In With Solana (SIWS) authentication
- Automatic 10,000 point credit on first connection

### 🎲 Prediction Markets
- Create markets for viral content predictions
- Yes/No betting with real-time odds
- Market categories: Social Media, Crypto, NFT, Tech
- Automatic market resolution and payout distribution

### ⏰ 48-Hour Test Window
- Configurable test duration via environment variables
- Real-time countdown timer
- Automatic market closure at test end
- Export eligible users for future $FOMO airdrop

### 👑 Admin Features
- Market resolution with evidence URLs
- Cancel markets and refund participants
- Export airdrop eligibility CSV
- Comprehensive action logging

## 🎮 Game Economy

- **Initial Credit**: 10,000 points per wallet (one-time)
- **Market Creation Fee**: 100 points (burned)
- **Minimum Bet**: 50 points
- **Trading Fee**: 2% per bet (to protocol pool)
- **Payout**: Proportional distribution to winning side

## 📊 Data & Analytics

All actions are logged in the `ActionLog` table:
- User connections and authentications
- Market creation and betting activity
- Admin actions and resolutions
- IP hashing for anti-abuse monitoring

## 🚀 Deployment

### Vercel + Supabase (Recommended)

1. **Database Setup**:
   ```bash
   # Create Supabase project
   # Copy DATABASE_URL to Vercel environment variables
   ```

2. **Deploy to Vercel**:
   ```bash
   # Connect GitHub repository to Vercel
   # Set environment variables in Vercel dashboard
   # Deploy automatically triggers on push
   ```

3. **Environment Variables** (Set in Vercel dashboard):
   ```
   DATABASE_URL=your_supabase_url
   JWT_SECRET=your_jwt_secret
   TEST_START_ISO=2025-09-06T11:00:00.000Z
   TEST_HOURS=48
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   ```

4. **Database Migration**:
   ```bash
   # Run once after deployment
   vercel env pull .env.local
   pnpm db:push
   pnpm db:seed
   ```

### Manual Deployment

```bash
# Build application
pnpm build

# Start production server
cd apps/web
pnpm start
```

## 🛡️ Security Features

- JWT-based session management
- SIWS signature verification
- SQL injection protection via Prisma
- Rate limiting on API routes
- IP hashing for user tracking
- Admin role-based access control

## 🔧 Customization

### Test Window Configuration

Modify test duration and timing:

```typescript
// lib/config.ts
export function getTestStartFromEnv(): Date {
  return new Date(process.env.TEST_START_ISO || Date.now())
}
```

### Adding New Market Categories

```typescript
// Update in multiple files:
// - prisma/seed.ts (test markets)
// - app/(app)/app/create/page.tsx (form options)
// - API validation schemas
```

### Custom Payout Logic

```typescript
// lib/utils.ts
export function calculatePayout(
  userBet: number,
  userSide: 'YES' | 'NO',
  totalYes: number,
  totalNo: number,
  winSide: 'YES' | 'NO'
): number {
  // Custom payout calculation
}
```

## 🎨 UI Customization

The app uses a custom design system based on Fomora brand colors:

```css
/* styles/globals.css */
:root {
  --fomora-red: #E6232E;
  --fomora-red-dark: #B8131C;
  --fomora-red-light: #FF4D57;
}
```

Modify `tailwind.config.ts` for theme changes.

## 📝 API Reference

### Authentication
- `POST /api/auth/nonce` - Generate signing nonce
- `POST /api/auth/verify` - Verify SIWS signature
- `GET /api/me` - Get current user (auto-credit points)

### Markets
- `GET /api/markets` - List markets with filters
- `POST /api/markets` - Create new market
- `GET /api/markets/[id]` - Get market details
- `POST /api/markets/[id]/bet` - Place bet

### Admin
- `POST /api/admin/markets/[id]/resolve` - Resolve market
- `GET /api/admin/export/airdrop` - Export eligibility CSV

### Utilities
- `GET /api/config` - Get test window configuration
- `GET /api/leaderboard` - Get user rankings

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests (Playwright)
pnpm test:e2e

# Manual testing checklist:
# ✅ Wallet connection (multiple wallets)
# ✅ Point crediting (first-time only)
# ✅ Market creation (fee deduction)
# ✅ Betting (odds updates, payout calculation)
# ✅ Admin resolution (proper distribution)
# ✅ CSV export (correct formatting)
```

## 🚨 Production Considerations

### Performance
- Database indexing for large user bases
- Redis caching for market data
- CDN for static assets
- Connection pooling for database

### Security
- Rate limiting implementation
- CORS configuration
- Environment variable validation
- Audit logging enhancement

### Monitoring
- Error tracking (Sentry)
- Performance monitoring
- Database query optimization
- User analytics

## 📞 Support

- **Documentation**: This README and inline code comments
- **Issues**: GitHub Issues for bug reports
- **Community**: Discord/Telegram for discussions

## 📄 License

This project is for demonstration purposes. Modify licensing as needed for production use.

---

**Built for the Fomora 48-hour prediction market test** 🎯

Remember: This is a **test environment** using **devnet** and **fake points**. No real money is involved.
