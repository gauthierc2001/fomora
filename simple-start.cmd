@echo off
echo 🚀 Simple Fomora Start (Minimal Setup)
echo.

REM Create .env in root
echo Creating .env file...
(
echo DATABASE_URL=postgresql://postgres:h9iD9ejrgh*#vAv@db.klucdodkixhvbwahprev.supabase.co:5432/postgres
echo JWT_SECRET=FoMoRa2025PredictionMarketJWTSecretKey48HourTestBetOnInternet
echo TEST_START_ISO=2025-01-15T12:00:00.000Z
echo TEST_HOURS=48
echo NEXT_PUBLIC_SOLANA_NETWORK=devnet
echo NEXTAUTH_URL=http://localhost:8000
echo NEXT_PUBLIC_APP_URL=http://localhost:8000
) > .env

REM Install dependencies
echo Installing dependencies...
pnpm install

REM Setup database
echo Setting up database...
cd packages\db
copy ..\..\env .env 2>nul
pnpm db:generate
pnpm db:push
pnpm db:seed

REM Go to web app and start
echo Starting web application...
cd ..\..
cd apps\web
copy ..\..\env .env.local 2>nul

echo.
echo 🌐 Starting server at http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

pnpm dev
