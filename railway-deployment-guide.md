# Railway Deployment - Final Configuration

## ✅ Fixed Issues:
1. **pnpm version compatibility** - Updated to pnpm@9.0.0
2. **Lockfile compatibility** - Using `--no-frozen-lockfile` 
3. **Monorepo start command** - Added to root package.json
4. **Build configuration** - Custom nixpacks.toml

## 📁 Files Created/Updated:
- ✅ `package.json` - Added start script, updated pnpm version
- ✅ `railway.json` - Railway configuration
- ✅ `nixpacks.toml` - Build configuration with `--no-frozen-lockfile`
- ✅ `.railwayignore` - Ignore unnecessary files
- ✅ `pnpm-lock.yaml` - Regenerated with correct pnpm version

## 🚀 Deployment Steps:

### 1. **Commit All Changes**
```bash
git add .
git commit -m "Configure Railway deployment with fixed pnpm lockfile"
git push
```

### 2. **Deploy on Railway**
- Go to Railway dashboard
- Click "Redeploy" or deploy from GitHub

### 3. **Add Environment Variables**
In Railway Variables tab, add:
```env
DATABASE_URL=postgresql://postgres:h9iD9ejrgh*#vAv@db.klucdodkixhvbwahprev.supabase.co:5432/postgres
JWT_SECRET=FoMoRa2025PredictionMarketJWTSecretKey48HourTestBetOnInternet
TEST_START_ISO=2025-01-15T12:00:00.000Z
TEST_HOURS=48
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NODE_ENV=production
PORT=3000
```

## 🔄 Fallback Option (If pnpm still fails):

If you still get pnpm issues:

1. **Rename files**:
   - `nixpacks.toml` → `nixpacks-pnpm.toml`
   - `nixpacks-npm.toml` → `nixpacks.toml`

2. **Update package.json** (remove packageManager):
   ```json
   // Remove this line:
   "packageManager": "pnpm@9.0.0"
   ```

3. **Redeploy** - will use npm instead

## 🎯 Expected Results:
- ✅ **Build succeeds** - no more lockfile errors
- ✅ **App starts** - proper monorepo handling
- ✅ **Database connects** - direct connection works on Railway
- ✅ **Authentication works** - no more 401 errors
- ✅ **Wallet connection** - should work perfectly

## 🔍 Debugging:
If issues persist, check Railway logs:
- **Build Logs** - for build/install errors
- **Deploy Logs** - for startup errors
- **Application Logs** - for runtime errors

Railway should now work perfectly for your prediction market app! 🚂✨
