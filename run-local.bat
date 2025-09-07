@echo off
echo 🚀 Starting Fomora Local Setup...
echo.

REM Check if .env exists
if not exist ".env" (
    echo 📄 Creating .env file...
    copy env.example .env
    echo.
    echo ⚠️  IMPORTANT: Edit .env file and update:
    echo    DATABASE_URL with your Supabase password
    echo    JWT_SECRET with a secure 32+ character string
    echo.
    echo Press any key after updating .env file...
    pause >nul
)

echo 🔧 Installing dependencies...
call pnpm install

echo 📊 Generating Prisma client...
call pnpm db:generate

echo 🗄️  Setting up database schema...
call pnpm db:push

echo 🌱 Seeding database with test markets...
call pnpm db:seed

echo.
echo ✅ Setup complete! Starting development server...
echo 🌐 App will be available at: http://localhost:8000
echo.

call pnpm dev
