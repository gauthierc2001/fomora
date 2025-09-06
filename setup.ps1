# Fomora Local Setup Script
Write-Host "🚀 Setting up Fomora locally..." -ForegroundColor Green

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "📄 Creating .env file..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✅ .env file created. Please edit it with your database details." -ForegroundColor Green
    Write-Host ""
    Write-Host "Edit .env file and set:" -ForegroundColor Cyan
    Write-Host "DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.klucdodkixhvbwahprev.supabase.co:5432/postgres" -ForegroundColor White
    Write-Host "JWT_SECRET=a-secure-32-character-secret-key" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Enter after you've updated the .env file..."
    Read-Host
}

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
pnpm db:generate

# Push database schema
Write-Host "📊 Setting up database schema..." -ForegroundColor Yellow
pnpm db:push

# Seed database
Write-Host "🌱 Seeding database with test markets..." -ForegroundColor Yellow
pnpm db:seed

Write-Host ""
Write-Host "✅ Setup complete! Starting development server..." -ForegroundColor Green
Write-Host "🌐 Your app will be available at http://localhost:8000" -ForegroundColor Cyan
Write-Host ""

# Start development server
pnpm dev
