@echo off
echo 🚀 Fomora FIXED Setup - Resolving Issues...
echo.

echo 📄 Creating .env file...
echo # Database (Supabase) > .env
echo DATABASE_URL="postgresql://postgres:h9iD9ejrgh*#vAv@db.klucdodkixhvbwahprev.supabase.co:5432/postgres" >> .env
echo. >> .env
echo # JWT Secret for session management >> .env
echo JWT_SECRET="FoMoRa2025PredictionMarketJWTSecretKey48HourTestBetOnInternet" >> .env
echo. >> .env
echo # Test Configuration >> .env
echo TEST_START_ISO="2025-01-15T12:00:00.000Z" >> .env
echo TEST_HOURS="48" >> .env
echo. >> .env
echo # Solana Network (devnet for testing) >> .env
echo NEXT_PUBLIC_SOLANA_NETWORK="devnet" >> .env
echo. >> .env
echo # App URLs >> .env
echo NEXTAUTH_URL="http://localhost:8000" >> .env
echo NEXT_PUBLIC_APP_URL="http://localhost:8000" >> .env

echo ✅ .env file created successfully!
echo.

echo 🔧 Installing root dependencies (turbo)...
call pnpm install

echo 📦 Installing workspace dependencies...
call pnpm install --recursive

echo 📊 Generating Prisma client...
cd packages\db
call pnpm db:generate
cd ..\..

echo 🗄️  Setting up database schema...
cd packages\db
call pnpm db:push
cd ..\..

echo 🌱 Seeding database...
cd packages\db
call pnpm db:seed
cd ..\..

echo.
echo 🎉 SETUP COMPLETE!
echo 🌐 Starting Fomora at: http://localhost:8000
echo.

cd apps\web
call pnpm dev
