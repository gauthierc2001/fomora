# Fomora Complete Setup - PowerShell Script
Write-Host "🚀 Fomora Complete Setup Starting..." -ForegroundColor Green

# Create .env file
Write-Host "📄 Creating .env file..." -ForegroundColor Yellow
@"
DATABASE_URL=postgresql://postgres:h9iD9ejrgh*#vAv@db.klucdodkixhvbwahprev.supabase.co:5432/postgres
JWT_SECRET=FoMoRa2025PredictionMarketJWTSecretKey48HourTestBetOnInternet
TEST_START_ISO=2025-01-15T12:00:00.000Z
TEST_HOURS=48
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXTAUTH_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:8000
"@ | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "✅ .env file created" -ForegroundColor Green

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
pnpm install

# Install workspace dependencies  
Write-Host "📦 Installing workspace dependencies..." -ForegroundColor Yellow
pnpm install --recursive

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
Set-Location "packages/db"
pnpm db:generate
Set-Location "../.."

# Setup database
Write-Host "🗄️ Setting up database..." -ForegroundColor Yellow
Set-Location "packages/db"
pnpm db:push
Set-Location "../.."

# Seed database
Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
Set-Location "packages/db"
pnpm db:seed
Set-Location "../.."

Write-Host ""
Write-Host "🎉 Setup Complete! Starting Fomora..." -ForegroundColor Green
Write-Host "🌐 App will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""

# Start the development server
Set-Location "apps/web"
pnpm dev
