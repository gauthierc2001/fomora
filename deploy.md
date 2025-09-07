# Fomora Deployment Guide

Complete guide for deploying Fomora to Vercel + Supabase.

## 1. Database Setup (Supabase)

### Create Supabase Project
1. Go to [supabase.io](https://supabase.io) and create account
2. Create new project
3. Choose region closest to your users
4. Wait for database provisioning

### Get Database URL
1. Go to Project Settings → Database
2. Copy the URI under "Connection string"
3. Replace `[YOUR-PASSWORD]` with your database password
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

## 2. Vercel Deployment

### Connect Repository
1. Push code to GitHub repository
2. Go to [vercel.com](https://vercel.com) and import project
3. Select your GitHub repository
4. Choose framework: **Next.js**

### Environment Variables
Set these in Vercel dashboard (Settings → Environment Variables):

```
DATABASE_URL=postgresql://postgres:[pass]@[host]:5432/postgres
JWT_SECRET=your-32-character-secret-here
TEST_START_ISO=2025-09-06T11:00:00.000Z
TEST_HOURS=48
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

### Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `cd apps/web && npm run build`
- **Install Command**: `pnpm install`
- **Output Directory**: `apps/web/.next`

## 3. Database Migration

After successful Vercel deployment:

```bash
# Pull environment variables locally
vercel env pull .env.local

# Run database migration
cd packages/db
pnpm db:push

# Seed test data
pnpm db:seed
```

## 4. Create Admin User

```bash
# Replace with your Solana wallet address
tsx scripts/setup-admin.ts FoMoRaAdm1nW4ll3tPubl1cK3yF0rT3st1ng12345
```

## 5. Verify Deployment

### Test Checklist
- [ ] Landing page loads at your Vercel URL
- [ ] Wallet connection works
- [ ] User receives 10,000 points on first connect
- [ ] Markets page shows seeded data
- [ ] Market creation works (deducts 100 points)
- [ ] Betting functionality works
- [ ] Timer shows correct countdown
- [ ] Admin panel accessible with admin wallet

### Performance Checks
- [ ] Page load times < 3s
- [ ] API responses < 500ms
- [ ] Database queries optimized
- [ ] No console errors

## 6. Custom Domain (Optional)

1. In Vercel dashboard: Settings → Domains
2. Add your custom domain
3. Configure DNS according to Vercel instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable

## 7. Environment-Specific Configuration

### Development
```bash
DATABASE_URL=postgresql://localhost:5432/fomora_dev
JWT_SECRET=dev-secret-32-chars-minimum
TEST_START_ISO=2025-09-06T11:00:00.000Z
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

### Production
```bash
DATABASE_URL=your-supabase-url
JWT_SECRET=secure-production-secret
TEST_START_ISO=2025-09-06T11:00:00.000Z
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

## 8. Monitoring & Maintenance

### Database Monitoring
- Monitor Supabase dashboard for performance
- Check connection limits (max 60 for free tier)
- Monitor storage usage

### Application Monitoring
- Vercel Analytics for performance metrics
- Check error logs in Vercel Function Logs
- Monitor API response times

### Test Window Management
- Update `TEST_START_ISO` for new test windows
- Monitor user activity and point distribution
- Prepare CSV export for airdrop eligibility

## 9. Troubleshooting

### Common Issues

**Database Connection Errors:**
```bash
# Check DATABASE_URL format
# Verify Supabase project is active
# Test connection locally
```

**Wallet Connection Issues:**
```bash
# Verify NEXT_PUBLIC_SOLANA_NETWORK is set
# Check wallet adapter configuration
# Test with different wallet providers
```

**Build Failures:**
```bash
# Check all dependencies are installed
# Verify TypeScript compilation
# Review build logs in Vercel
```

### Performance Issues
- Enable Vercel Edge Functions for API routes
- Implement database connection pooling
- Add Redis caching for frequently accessed data
- Optimize images and static assets

## 10. Security Considerations

### Production Hardening
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] Database password rotation
- [ ] Rate limiting on API endpoints
- [ ] CORS configuration
- [ ] Environment variable validation

### Monitoring
- [ ] Error tracking (Sentry integration)
- [ ] Performance monitoring
- [ ] Security headers configuration
- [ ] SSL/TLS verification

## 11. Scaling Considerations

For production use beyond test:
- Database connection pooling (PgBouncer)
- Redis for session storage and caching
- Separate database read replicas
- CDN for static assets
- Load balancing for high traffic

## 12. Backup & Recovery

- Supabase automatic backups (daily for paid plans)
- Manual database exports before major changes
- Environment variable backup
- Code repository backup

---

## Quick Deploy Commands

```bash
# Initial setup
git clone <repo>
cd fomora
pnpm install

# Deploy to Vercel
vercel --prod

# Setup database
vercel env pull .env.local
cd packages/db
pnpm db:push
pnpm db:seed

# Create admin
tsx scripts/setup-admin.ts <your-wallet-address>
```

Your Fomora prediction market is now live! 🚀
