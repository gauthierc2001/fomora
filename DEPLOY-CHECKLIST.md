# 🚀 Vercel Deployment Checklist

Your FoMoRa app is ready for deployment! Everything is working perfectly locally.

## ✅ Pre-Deployment Status
- [x] App runs perfectly on localhost:8000
- [x] Supabase database connected and working
- [x] User authentication working
- [x] Markets loading (21 markets, 3 bets, 35 FOMO markets)
- [x] Wallet integration working
- [x] All dependencies installed
- [x] Build configuration ready

## 🔧 Deployment Steps

### 1. Push to GitHub (if not already done)
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Root Directory: **Leave empty** (monorepo configured)
5. Build settings are already configured in `vercel.json`

### 3. Set Environment Variables in Vercel
Go to Vercel Dashboard → Settings → Environment Variables and add:

```
DATABASE_URL=postgresql://postgres:h9iD9ejrgh*#vAv@db.klucdodkixhvbwahprev.supabase.co:5432/postgres
JWT_SECRET=FoMoRa2025PredictionMarketJWTSecretKey48HourTestBetOnInternet
TEST_START_ISO=2025-01-15T12:00:00.000Z
TEST_HOURS=48
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

### 4. Update URLs After First Deploy
After deployment, update these environment variables with your actual Vercel URL:
```
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

## ✅ Post-Deployment Verification
- [ ] App loads at Vercel URL
- [ ] Wallet connection works
- [ ] Markets display correctly
- [ ] User authentication works
- [ ] Database operations work

## 📋 Build Configuration (Already Set)
- **Framework**: Next.js
- **Build Command**: `cd apps/web && pnpm build`
- **Install Command**: `pnpm install --no-frozen-lockfile`
- **Output Directory**: `apps/web/.next`

## 🎯 Everything is Ready!
Your app is working perfectly locally and all configuration is in place for a smooth Vercel deployment.
