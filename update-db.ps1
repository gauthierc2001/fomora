# Update .env file with Supabase database URL
$envContent = Get-Content ".env" -Raw
$envContent = $envContent -replace 'DATABASE_URL=".*"', 'DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.klucdodkixhvbwahprev.supabase.co:5432/postgres"'
$envContent | Set-Content ".env" -NoNewline

Write-Host "✅ Updated .env file with Supabase database URL" -ForegroundColor Green
Write-Host "⚠️  Remember to replace [YOUR-PASSWORD] with your actual Supabase password" -ForegroundColor Yellow
