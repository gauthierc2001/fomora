# Production-ready setup for Fomora
Write-Host "Setting up Fomora for production-ready development..." -ForegroundColor Green

# Create .env file with production-ready configuration
$envContent = @"
# Database - Using Supabase (production-ready cloud PostgreSQL)
DATABASE_URL="postgresql://postgres.xyzcompany:your_password@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# JWT Secret for session management (32+ characters)
JWT_SECRET="production-ready-jwt-secret-key-for-fomora-app-32-chars-minimum"

# Test Configuration
TEST_START_ISO="2025-01-15T12:00:00.000Z"
TEST_HOURS="48"

# Solana Network (devnet for testing)
NEXT_PUBLIC_SOLANA_NETWORK="devnet"

# App URLs
NEXTAUTH_URL="http://localhost:8000"
NEXT_PUBLIC_APP_URL="http://localhost:8000"
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8
Write-Host "✅ Created .env file" -ForegroundColor Green

Write-Host "⚠️  IMPORTANT: You need to update DATABASE_URL with your actual database connection string" -ForegroundColor Yellow
Write-Host "📝 Recommended: Create a free Supabase account at https://supabase.com" -ForegroundColor Cyan
Write-Host "🔗 Then replace the DATABASE_URL in .env with your Supabase connection string" -ForegroundColor Cyan
