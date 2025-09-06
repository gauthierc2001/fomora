@echo off
echo 🔧 Manual Fix for Fomora Setup Issues
echo.

echo Step 1: Creating .env file with proper format...
(
echo DATABASE_URL=postgresql://postgres:h9iD9ejrgh*#vAv@db.klucdodkixhvbwahprev.supabase.co:5432/postgres
echo JWT_SECRET=FoMoRa2025PredictionMarketJWTSecretKey48HourTestBetOnInternet
echo TEST_START_ISO=2025-01-15T12:00:00.000Z
echo TEST_HOURS=48
echo NEXT_PUBLIC_SOLANA_NETWORK=devnet
echo NEXTAUTH_URL=http://localhost:8000
echo NEXT_PUBLIC_APP_URL=http://localhost:8000
) > .env

echo ✅ .env created
echo.

echo Step 2: Installing dependencies...
pnpm install
echo.

echo Step 3: Database setup...
cd packages/db
pnpm install
pnpm db:generate
pnpm db:push
pnpm db:seed
cd ../..
echo.

echo Step 4: Web app setup...
cd apps/web
pnpm install
echo.

echo 🎉 Ready to start!
echo Run this to start the server:
echo    cd apps/web
echo    pnpm dev
echo.
echo Then open: http://localhost:8000
