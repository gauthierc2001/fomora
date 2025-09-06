@echo off
echo 🚀 Fomora Final Setup with Your Configuration...
echo.

echo 📄 Creating .env file with your database credentials...
(
echo # Database (Supabase^)
echo DATABASE_URL="postgresql://postgres:h9iD9ejrgh*#vAv@db.klucdodkixhvbwahprev.supabase.co:5432/postgres"
echo.
echo # JWT Secret for session management
echo JWT_SECRET="FoMoRa2025PredictionMarketJWTSecretKey48HourTestBetOnInternet"
echo.
echo # Test Configuration
echo TEST_START_ISO="2025-01-15T12:00:00.000Z"
echo TEST_HOURS="48"
echo.
echo # Solana Network (devnet for testing^)
echo NEXT_PUBLIC_SOLANA_NETWORK="devnet"
echo.
echo # App URLs
echo NEXTAUTH_URL="http://localhost:8000"
echo NEXT_PUBLIC_APP_URL="http://localhost:8000"
) > .env

echo ✅ .env file created with your credentials!
echo.

echo 🔧 Installing dependencies...
call pnpm install

echo 📊 Generating Prisma client...
call pnpm db:generate

echo 🗄️  Pushing database schema to Supabase...
call pnpm db:push

echo 🌱 Seeding database with 15 test markets...
call pnpm db:seed

echo.
echo 🎉 SETUP COMPLETE!
echo 🌐 Starting Fomora at: http://localhost:8000
echo.
echo What you can do now:
echo   ✅ Connect Solana wallet (Phantom/Solflare/Backpack)
echo   ✅ Get 10,000 free points automatically
echo   ✅ Browse 15 prediction markets
echo   ✅ Place bets (min 50 points)
echo   ✅ Create markets (100 points fee)
echo   ✅ Check leaderboard rankings
echo.

call pnpm dev
