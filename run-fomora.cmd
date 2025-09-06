@echo off
echo Creating .env file...
echo DATABASE_URL=postgresql://postgres:h9iD9ejrgh*#vAv@db.klucdodkixhvbwahprev.supabase.co:5432/postgres > .env
echo JWT_SECRET=FoMoRa2025PredictionMarketJWTSecretKey48HourTestBetOnInternet >> .env
echo TEST_START_ISO=2025-01-15T12:00:00.000Z >> .env
echo TEST_HOURS=48 >> .env
echo NEXT_PUBLIC_SOLANA_NETWORK=devnet >> .env
echo NEXTAUTH_URL=http://localhost:8000 >> .env
echo NEXT_PUBLIC_APP_URL=http://localhost:8000 >> .env

echo Installing dependencies...
call pnpm install

echo Setting up database packages...
cd packages\db
copy ..\..\env .env
call pnpm install
call pnpm db:generate
call pnpm db:push
call pnpm db:seed
cd ..\..

echo Setting up web app...
cd apps\web
copy ..\..\env .env.local
call pnpm install
echo Starting Fomora on http://localhost:8000
call pnpm dev
