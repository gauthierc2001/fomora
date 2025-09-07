@echo off
echo 🚀 Minimal Fomora Install (Fixed)
echo.

REM Create environment file
echo Creating .env...
echo DATABASE_URL=postgresql://postgres:h9iD9ejrgh*#vAv@db.klucdodkixhvbwahprev.supabase.co:5432/postgres > .env
echo JWT_SECRET=FoMoRa2025PredictionMarketJWTSecretKey48HourTestBetOnInternet >> .env
echo TEST_START_ISO=2025-01-15T12:00:00.000Z >> .env
echo TEST_HOURS=48 >> .env
echo NEXT_PUBLIC_SOLANA_NETWORK=devnet >> .env
echo NEXTAUTH_URL=http://localhost:8000 >> .env
echo NEXT_PUBLIC_APP_URL=http://localhost:8000 >> .env

REM Install packages individually to avoid workspace issues
echo Installing packages...
call npm install -g prisma

echo Installing database packages...
cd packages\db
call npm install @prisma/client prisma tsx typescript
call npx prisma generate
call npx prisma db push  
call npx tsx prisma/seed.ts
cd ..\..

echo Installing web app packages...
cd apps\web
call npm install
call npm run dev
