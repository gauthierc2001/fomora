# Railway Deployment Guide for Fomora

## Why Railway is Better for Your App:
- ✅ **No serverless limitations** - persistent connections work great
- ✅ **Use your original Supabase direct connection** - no transaction pooler needed
- ✅ **Better database connectivity** - no more 401 auth errors
- ✅ **Easier debugging** - clearer logs and error messages
- ✅ **More predictable** - less "magic" that can break

## Step-by-Step Setup:

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub (recommended)
- Connect your GitHub account

### 2. Deploy Your Project
- Click **"New Project"**
- Select **"Deploy from GitHub repo"**
- Choose your Fomora repository
- Railway will automatically detect it's a Next.js app

### 3. Set Environment Variables
In Railway dashboard, go to your project → **Variables** tab and add:

```env
DATABASE_URL=postgresql://postgres:h9iD9ejrgh*#vAv@db.klucdodkixhvbwahprev.supabase.co:5432/postgres
JWT_SECRET=FoMoRa2025PredictionMarketJWTSecretKey48HourTestBetOnInternet
TEST_START_ISO=2025-01-15T12:00:00.000Z
TEST_HOURS=48
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NODE_ENV=production
PORT=3000
```

**Note**: We're using the **original direct connection** URL (port 5432) - no transaction pooler needed!

### 4. Configure Build Settings
Railway should auto-detect, but if needed:
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `cd apps/web && pnpm start`
- **Root Directory**: Leave empty (monorepo setup)

### 5. Deploy
- Railway will automatically build and deploy
- You'll get a URL like: `https://your-app-production.up.railway.app`
- First deployment takes 3-5 minutes

## Expected Results:
- ✅ **No more 401 authentication errors**
- ✅ **Wallet connection works immediately**
- ✅ **Database operations are reliable**
- ✅ **Better performance for your prediction market**

## Troubleshooting:
If you have any issues:
1. Check the **Deploy Logs** in Railway dashboard
2. Check **Application Logs** for runtime errors
3. Verify all environment variables are set

## Cost:
- **Free tier**: $5 credit per month (should be enough for testing)
- **Pro plan**: $20/month if you need more resources

---

Ready to deploy? Follow the steps above and your authentication issues should be completely resolved! 🚀
