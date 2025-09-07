# Fomora - Fixed Quickstart

I've fixed all the setup issues. Here's what you need to do:

## Method 1: PowerShell (Recommended)
```powershell
.\install-and-run.ps1
```

## Method 2: Command Prompt
```cmd
run-fomora.cmd
```

## Method 3: Manual Commands
```bash
# 1. Create .env file manually
echo DATABASE_URL=postgresql://postgres:h9iD9ejrgh*#vAv@db.klucdodkixhvbwahprev.supabase.co:5432/postgres > .env
echo JWT_SECRET=FoMoRa2025PredictionMarketJWTSecretKey48HourTestBetOnInternet >> .env
echo TEST_START_ISO=2025-01-15T12:00:00.000Z >> .env
echo TEST_HOURS=48 >> .env
echo NEXT_PUBLIC_SOLANA_NETWORK=devnet >> .env
echo NEXTAUTH_URL=http://localhost:8000 >> .env
echo NEXT_PUBLIC_APP_URL=http://localhost:8000 >> .env

# 2. Install and setup
pnpm install
cd packages/db && copy ../../.env .env && pnpm install && pnpm db:generate && pnpm db:push && pnpm db:seed && cd ../..
cd apps/web && copy ../../.env .env.local && pnpm install && pnpm dev
```

## What's Fixed:
✅ Environment file creation (.env)  
✅ Database connection with your password  
✅ JWT secret configuration  
✅ Workspace dependency installation  
✅ Prisma client generation  
✅ Database schema setup  
✅ Test market seeding  
✅ Development server startup  

## Expected Result:
- Server starts at http://localhost:8000
- Landing page with "Enter App" button
- Wallet connection works
- 10,000 points credited automatically
- 15 prediction markets available
- Real-time betting functionality

## Test Flow:
1. Open http://localhost:8000
2. Click "Enter App"
3. Connect Solana wallet (Phantom/Solflare/Backpack)
4. Receive 10,000 points
5. Browse markets and place bets
6. Create new markets (100 point fee)
7. Check leaderboard

Your Fomora prediction market is ready! 🚀
