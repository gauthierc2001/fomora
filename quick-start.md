# Fomora Quick Start Guide

## Step 1: Update your .env file

1. Copy the example: `copy env.example .env`
2. Edit `.env` and update these values:

```env
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.klucdodkixhvbwahprev.supabase.co:5432/postgres"
JWT_SECRET="generate-a-secure-32-character-secret-here-please"
TEST_START_ISO="2025-01-15T12:00:00.000Z"
TEST_HOURS="48"
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
NEXTAUTH_URL="http://localhost:8000"
NEXT_PUBLIC_APP_URL="http://localhost:8000"
```

**Important:** Replace `YOUR_ACTUAL_PASSWORD` with your Supabase database password!

## Step 2: Generate JWT Secret

Run this in PowerShell to generate a secure secret:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

Copy the output and use it as your JWT_SECRET.

## Step 3: Run Setup Script

In PowerShell, run:
```powershell
.\setup.ps1
```

This will:
- Generate Prisma client
- Set up database schema  
- Seed test markets
- Start the development server

## Step 4: Access the App

Open your browser to: http://localhost:8000

## Step 5: Test the App

1. Connect a Solana wallet (Phantom, Solflare, or Backpack)
2. You'll automatically receive 10,000 test points
3. Browse the 15 seeded prediction markets
4. Place bets or create new markets

## Troubleshooting

- **Database errors**: Double-check your DATABASE_URL has the correct password
- **Port conflicts**: Make sure port 8000 is free
- **Wallet issues**: Install a Solana wallet browser extension

## Create Admin User (Optional)

After the app is running, create an admin user:
```powershell
npx tsx scripts/setup-admin.ts YOUR_SOLANA_WALLET_ADDRESS
```

Replace with your actual wallet public key to access admin features.
