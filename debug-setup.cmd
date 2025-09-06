@echo off
echo 🔍 Debugging Fomora Setup Issues...
echo.

echo Step 1: Checking if .env file exists...
if exist .env (
    echo ✅ .env file found
    echo Contents:
    type .env
) else (
    echo ❌ .env file missing - creating it now...
    echo DATABASE_URL=postgresql://postgres:h9iD9ejrgh*#vAv@db.klucdodkixhvbwahprev.supabase.co:5432/postgres > .env
    echo JWT_SECRET=FoMoRa2025PredictionMarketJWTSecretKey48HourTestBetOnInternet >> .env
    echo TEST_START_ISO=2025-01-15T12:00:00.000Z >> .env
    echo TEST_HOURS=48 >> .env
    echo NEXT_PUBLIC_SOLANA_NETWORK=devnet >> .env
    echo NEXTAUTH_URL=http://localhost:8000 >> .env
    echo NEXT_PUBLIC_APP_URL=http://localhost:8000 >> .env
    echo ✅ .env file created
)
echo.

echo Step 2: Checking dependencies...
echo Checking if node_modules exists...
if exist node_modules (
    echo ✅ Root node_modules found
) else (
    echo ❌ Root node_modules missing - installing...
    call pnpm install
)

echo Checking web app node_modules...
if exist apps\web\node_modules (
    echo ✅ Web app node_modules found
) else (
    echo ❌ Web app node_modules missing - installing...
    cd apps\web
    call pnpm install
    cd ..\..
)
echo.

echo Step 3: Database setup...
cd packages\db
if not exist .env copy ..\..\env .env
echo Running database commands...
call pnpm install
call pnpm db:generate
echo Testing database connection...
call pnpm db:push
if errorlevel 1 (
    echo ❌ Database connection failed!
    echo Check your DATABASE_URL in .env file
    pause
    exit /b 1
)
call pnpm db:seed
cd ..\..
echo.

echo Step 4: Starting web server...
cd apps\web
if not exist .env.local copy ..\..\env .env.local
echo Starting Next.js development server...
call pnpm dev
