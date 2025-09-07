# Update Vercel Environment Variables

## Quick Fix for Authentication Issues

The 401 authentication errors are caused by using the wrong database connection type. Vercel needs the **Transaction Pooler** connection.

## Steps to Fix:

### 1. Go to Vercel Dashboard
- Open [vercel.com](https://vercel.com)
- Go to your project
- Click "Settings" → "Environment Variables"

### 2. Update DATABASE_URL
Find the `DATABASE_URL` variable and replace it with:

```
postgresql://postgres.klucdodkixhvbwahprev:h9iD9ejrgh*#vAv@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
```

### 3. Verify All Environment Variables
Make sure these are set for **Production**:

```
DATABASE_URL=postgresql://postgres.klucdodkixhvbwahprev:h9iD9ejrgh*#vAv@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
JWT_SECRET=FoMoRa2025PredictionMarketJWTSecretKey48HourTestBetOnInternet
TEST_START_ISO=2025-01-15T12:00:00.000Z
TEST_HOURS=48
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

### 4. Redeploy
After updating the environment variable:
- Go to "Deployments" tab
- Click "Redeploy" on the latest deployment
- Or make a small commit to trigger automatic deployment

## Why This Fixes the Issue

- **Before**: Direct connection (for persistent connections)
- **After**: Transaction pooler (for serverless functions)
- **Result**: Database connections work properly in Vercel

The authentication should work immediately after redeployment!
