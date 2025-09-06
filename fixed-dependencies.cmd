@echo off
echo 🔧 Fixing Fomora Dependencies and Setup
echo.

echo Step 1: Creating .env file...
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
echo Step 2: Cleaning and installing dependencies...
if exist node_modules rmdir /s /q node_modules
if exist apps\web\node_modules rmdir /s /q apps\web\node_modules
if exist packages\db\node_modules rmdir /s /q packages\db\node_modules
if exist packages\config\node_modules rmdir /s /q packages\config\node_modules

echo Installing root dependencies...
call pnpm install --ignore-workspace

echo Installing workspace dependencies...
cd packages\db
call pnpm install
cd ..\..

cd apps\web  
call pnpm install
cd ..\..

echo.
echo Step 3: Setting up database...
cd packages\db
copy ..\..\env .env 2>nul
echo Generating Prisma client...
call npx prisma generate
echo Pushing database schema...
call npx prisma db push
echo Seeding database...
call npx tsx prisma/seed.ts
cd ..\..

echo.
echo Step 4: Starting web server...
cd apps\web
copy ..\..\env .env.local 2>nul
echo.
echo 🎉 Starting Fomora at http://localhost:8000
echo.
call pnpm dev
