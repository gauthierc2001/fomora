-- ============================================================================
-- FOMORA DATABASE SETUP - PRISMA SCHEMA SYNC
-- This script creates tables that match your current Prisma schema exactly
-- Then adds the missing fields needed for full functionality
-- ============================================================================

-- ============================================================================
-- 1. CLEAN SLATE - DROP EVERYTHING
-- ============================================================================
DROP TABLE IF EXISTS "bets" CASCADE;
DROP TABLE IF EXISTS "action_logs" CASCADE;
DROP TABLE IF EXISTS "markets" CASCADE;
DROP TABLE IF EXISTS "fomo_markets" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "config" CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "MarketStatus" CASCADE;
DROP TYPE IF EXISTS "BetSide" CASCADE;
DROP TYPE IF EXISTS "Resolution" CASCADE;
DROP TYPE IF EXISTS "ActionType" CASCADE;

-- ============================================================================
-- 2. CREATE ENUMS (EXACTLY AS IN PRISMA SCHEMA)
-- ============================================================================
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "MarketStatus" AS ENUM ('OPEN', 'CLOSED', 'RESOLVED', 'CANCELLED');
CREATE TYPE "BetSide" AS ENUM ('YES', 'NO');
CREATE TYPE "Resolution" AS ENUM ('YES', 'NO', 'CANCELLED');
CREATE TYPE "ActionType" AS ENUM ('CONNECT', 'CREDITS', 'CREATE_MARKET', 'BET', 'RESOLVE', 'CANCEL', 'LOGIN', 'ADMIN_ACTION');

-- ============================================================================
-- 3. CREATE TABLES MATCHING CURRENT PRISMA SCHEMA
-- ============================================================================

-- Users table (base Prisma schema)
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipHash" TEXT,
    "pointsBalance" INTEGER NOT NULL DEFAULT 0,
    "creditedInitial" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Markets table (base Prisma schema)
CREATE TABLE "markets" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "createdBy" TEXT NOT NULL,
    "status" "MarketStatus" NOT NULL DEFAULT 'OPEN',
    "closesAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolution" "Resolution",
    "yesPool" INTEGER NOT NULL DEFAULT 0,
    "noPool" INTEGER NOT NULL DEFAULT 0,
    "createFee" INTEGER NOT NULL DEFAULT 100,
    "txRef" TEXT,

    CONSTRAINT "markets_pkey" PRIMARY KEY ("id")
);

-- Bets table (base Prisma schema)
CREATE TABLE "bets" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" "BetSide" NOT NULL,
    "amount" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bets_pkey" PRIMARY KEY ("id")
);

-- Action logs table (base Prisma schema)
CREATE TABLE "action_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "ActionType" NOT NULL,
    "metadata" JSONB,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_logs_pkey" PRIMARY KEY ("id")
);

-- Config table (base Prisma schema)
CREATE TABLE "config" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "config_pkey" PRIMARY KEY ("key")
);

-- FOMO markets table (base Prisma schema)
CREATE TABLE "fomo_markets" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "yesPool" INTEGER NOT NULL DEFAULT 0,
    "noPool" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" INTEGER NOT NULL DEFAULT 0,
    "participants" INTEGER NOT NULL DEFAULT 0,
    "trending" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT NOT NULL,

    CONSTRAINT "fomo_markets_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- 4. ADD MISSING FIELDS NEEDED FOR FULL FUNCTIONALITY
-- ============================================================================

-- Add leaderboard fields to users table
ALTER TABLE "users" ADD COLUMN "displayName" TEXT;
ALTER TABLE "users" ADD COLUMN "profilePicture" TEXT;
ALTER TABLE "users" ADD COLUMN "totalBets" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "totalWagered" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "marketsCreated" INTEGER NOT NULL DEFAULT 0;

-- Add image field to markets table
ALTER TABLE "markets" ADD COLUMN "image" TEXT;

-- Add image and createdBy fields to fomo_markets table
ALTER TABLE "fomo_markets" ADD COLUMN "image" TEXT;
ALTER TABLE "fomo_markets" ADD COLUMN "createdBy" TEXT NOT NULL DEFAULT 'fomo-system';

-- ============================================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");
CREATE UNIQUE INDEX "markets_slug_key" ON "markets"("slug");
CREATE UNIQUE INDEX "fomo_markets_slug_key" ON "fomo_markets"("slug");

-- Performance indexes
CREATE INDEX "markets_status_idx" ON "markets"("status");
CREATE INDEX "markets_category_idx" ON "markets"("category");
CREATE INDEX "markets_createdAt_idx" ON "markets"("createdAt");
CREATE INDEX "markets_closesAt_idx" ON "markets"("closesAt");
CREATE INDEX "markets_createdBy_idx" ON "markets"("createdBy");
CREATE INDEX "bets_marketId_idx" ON "bets"("marketId");
CREATE INDEX "bets_userId_idx" ON "bets"("userId");
CREATE INDEX "bets_createdAt_idx" ON "bets"("createdAt");
CREATE INDEX "fomo_markets_status_idx" ON "fomo_markets"("status");
CREATE INDEX "fomo_markets_trending_idx" ON "fomo_markets"("trending");
CREATE INDEX "fomo_markets_closesAt_idx" ON "fomo_markets"("closesAt");
CREATE INDEX "users_pointsBalance_idx" ON "users"("pointsBalance");
CREATE INDEX "users_totalBets_idx" ON "users"("totalBets");
CREATE INDEX "users_totalWagered_idx" ON "users"("totalWagered");
CREATE INDEX "action_logs_userId_idx" ON "action_logs"("userId");
CREATE INDEX "action_logs_type_idx" ON "action_logs"("type");

-- ============================================================================
-- 6. ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================
ALTER TABLE "markets" ADD CONSTRAINT "markets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bets" ADD CONSTRAINT "bets_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bets" ADD CONSTRAINT "bets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "action_logs" ADD CONSTRAINT "action_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- 7. INSERT SYSTEM USERS AND CONFIGURATION
-- ============================================================================

-- System user for automated markets
INSERT INTO "users" ("id", "walletAddress", "role", "pointsBalance", "creditedInitial", "displayName", "totalBets", "totalWagered", "marketsCreated") 
VALUES ('system_user_001', '0x0000000000000000000000000000000000000000', 'ADMIN', 1000000, true, 'System', 0, 0, 0);

-- FOMO system user
INSERT INTO "users" ("id", "walletAddress", "role", "pointsBalance", "creditedInitial", "displayName", "totalBets", "totalWagered", "marketsCreated") 
VALUES ('fomo_system_001', '0x0000000000000000000000000000000000000001', 'ADMIN', 1000000, true, 'FOMO System', 0, 0, 0);

-- Sample active users with realistic stats for testing
INSERT INTO "users" ("id", "walletAddress", "pointsBalance", "creditedInitial", "displayName", "totalBets", "totalWagered", "marketsCreated") VALUES
('user_001', '0xabcdef1234567890abcdef1234567890abcdef12', 8500, true, 'CryptoWhale', 25, 12500, 2),
('user_002', '0x9876543210987654321098765432109876543210', 6200, true, 'DiamondHands', 18, 8900, 1),
('user_003', '0x1111222233334444555566667777888899990000', 9800, true, 'MoonShot', 32, 15600, 3);

-- Configuration values
INSERT INTO "config" ("key", "value") VALUES
('initial_credits', '1000'),
('market_create_fee', '100'),
('bet_fee_percentage', '2'),
('max_bet_amount', '10000'),
('min_bet_amount', '10'),
('max_markets_per_user', '3');

-- ============================================================================
-- 8. INSERT SAMPLE MARKETS WITH IMAGES
-- ============================================================================

INSERT INTO "markets" ("id", "slug", "question", "description", "category", "image", "createdBy", "status", "closesAt", "yesPool", "noPool", "createFee") VALUES
('market_crypto_btc_001', 'will-bitcoin-reach-70000-this-week', 'Will Bitcoin reach $70,000 this week?', 'Bitcoin is currently trading around $65,000. Technical analysis suggests a potential breakout above the $70K resistance level.', 'Crypto', 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', 'system_user_001', 'OPEN', NOW() + INTERVAL '7 days', 4200, 2800, 100),

('market_crypto_eth_001', 'will-ethereum-outperform-bitcoin-this-month', 'Will Ethereum outperform Bitcoin this month?', 'ETH has been showing strong fundamentals with increased DeFi activity and upcoming network upgrades.', 'Crypto', 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', 'system_user_001', 'OPEN', NOW() + INTERVAL '30 days', 3100, 2900, 100),

('market_meme_doge_001', 'will-dogecoin-pump-50-percent-this-week', 'Will Dogecoin pump 50% this week?', 'DOGE is showing signs of life with increased social media mentions and whale activity.', 'Memes', 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', 'system_user_001', 'OPEN', NOW() + INTERVAL '7 days', 5600, 1400, 100),

('market_tech_ai_001', 'will-chatgpt-have-major-outage-this-month', 'Will ChatGPT have a major outage this month?', 'AI services are under unprecedented load with millions of users.', 'Technology', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop', 'system_user_001', 'OPEN', NOW() + INTERVAL '30 days', 1800, 4200, 100),

('market_social_elon_001', 'will-elon-musk-tweet-about-crypto-today', 'Will Elon Musk tweet about crypto today?', 'Elon''s crypto tweets have historically moved markets instantly.', 'Social Media', 'https://images.unsplash.com/photo-1634912314704-c646c586b131?w=400&h=300&fit=crop', 'system_user_001', 'OPEN', NOW() + INTERVAL '1 day', 3800, 2200, 100);

-- ============================================================================
-- 9. INSERT FOMO MARKETS WITH IMAGES
-- ============================================================================

INSERT INTO "fomo_markets" ("id", "question", "description", "category", "image", "status", "closesAt", "yesPool", "noPool", "totalVolume", "participants", "trending", "slug", "createdBy") VALUES
('fomo_001', 'Will Bitcoin move $1000+ in the next 15 minutes?', 'Pure FOMO volatility - anything can happen in crypto.', 'FOMO', 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', 'OPEN', NOW() + INTERVAL '15 minutes', 2100, 2900, 5000, 32, true, 'bitcoin-move-1000-15-minutes', 'fomo_system_001'),

('fomo_002', 'Will any meme coin pump 1000% in the next hour?', 'Peak degeneracy hours for astronomical meme coin gains.', 'Hype', 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg', 'OPEN', NOW() + INTERVAL '1 hour', 4200, 1800, 6000, 45, true, 'meme-coin-pump-1000-percent-hour', 'fomo_system_001'),

('fomo_003', 'Will ''WAGMI'' trend on crypto Twitter in 30 minutes?', 'Classic crypto FOMO expression during market pumps.', 'FOMO', 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '30 minutes', 1900, 2100, 4000, 28, false, 'wagmi-trend-crypto-twitter-30-minutes', 'fomo_system_001'),

('fomo_004', 'Will Elon tweet about Dogecoin today?', 'Classic FOMO trigger - Elon''s crypto tweets move markets instantly.', 'FOMO', 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', 'OPEN', NOW() + INTERVAL '24 hours', 5200, 2800, 8000, 58, true, 'elon-tweet-dogecoin-today', 'fomo_system_001'),

('fomo_005', 'Will someone buy an NFT for over $100K in next 12 hours?', 'Peak NFT FOMO territory with whale purchases.', 'FOMO', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '12 hours', 2200, 3800, 6000, 35, false, 'nft-purchase-100k-12-hours', 'fomo_system_001'),

('fomo_006', 'Will ''To the moon'' get tweeted 1000+ times in 30 minutes?', 'Peak FOMO expression during explosive price action.', 'Viral', 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '30 minutes', 3100, 1900, 5000, 41, true, 'to-the-moon-tweeted-1000-times-30-minutes', 'fomo_system_001'),

('fomo_007', 'Will this FOMO market get 100+ bets in 1 hour?', 'Meta FOMO - betting on the FOMO of betting on FOMO.', 'Meta', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '1 hour', 1800, 2200, 4000, 22, false, 'fomo-market-100-bets-1-hour', 'fomo_system_001'),

('fomo_008', 'Will any crypto influencer claim ''not financial advice'' 50+ times today?', 'The more disclaimers, the more FOMO content incoming.', 'Buzz', 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '24 hours', 2600, 2400, 5000, 33, false, 'crypto-influencer-not-financial-advice-50-times', 'fomo_system_001'),

('fomo_009', 'Will someone livestream buying meme coins for 12 hours straight?', 'Peak degeneracy content creation meets FOMO trading.', 'Hype', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '12 hours', 1700, 3300, 5000, 29, true, 'livestream-buying-meme-coins-12-hours', 'fomo_system_001'),

('fomo_010', 'Will ''number go up'' technology trend globally in 30 minutes?', 'Classic crypto FOMO meme reaching normie territory.', 'Viral', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '30 minutes', 2000, 2000, 4000, 25, false, 'number-go-up-technology-trend-30-minutes', 'fomo_system_001');

-- ============================================================================
-- 10. INSERT SAMPLE BETS
-- ============================================================================

INSERT INTO "bets" ("id", "marketId", "userId", "side", "amount", "fee") VALUES
('bet_001', 'market_crypto_btc_001', 'user_001', 'YES', 800, 16),
('bet_002', 'market_crypto_btc_001', 'user_002', 'NO', 600, 12),
('bet_003', 'market_crypto_eth_001', 'user_003', 'YES', 900, 18),
('bet_004', 'market_meme_doge_001', 'user_001', 'YES', 1000, 20),
('bet_005', 'market_tech_ai_001', 'user_002', 'NO', 400, 8),
('bet_006', 'market_social_elon_001', 'user_003', 'YES', 600, 12);

-- ============================================================================
-- 11. INSERT ACTION LOGS
-- ============================================================================

INSERT INTO "action_logs" ("id", "userId", "type", "metadata") VALUES
('log_001', 'user_001', 'CONNECT', '{"walletAddress": "0xabcdef1234567890abcdef1234567890abcdef12"}'),
('log_002', 'user_001', 'CREDITS', '{"amount": 1000, "reason": "initial_signup"}'),
('log_003', 'user_001', 'BET', '{"marketId": "market_crypto_btc_001", "side": "YES", "amount": 800}'),
('log_004', 'user_002', 'CONNECT', '{"walletAddress": "0x9876543210987654321098765432109876543210"}'),
('log_005', 'user_002', 'BET', '{"marketId": "market_crypto_btc_001", "side": "NO", "amount": 600}'),
('log_006', 'user_003', 'BET', '{"marketId": "market_crypto_eth_001", "side": "YES", "amount": 900}');

-- ============================================================================
-- 12. CREATE FUNCTIONS TO UPDATE USER STATISTICS
-- ============================================================================

-- Function to update user statistics when bets are placed
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user statistics
    UPDATE users SET 
        "totalBets" = "totalBets" + 1,
        "totalWagered" = "totalWagered" + NEW.amount
    WHERE id = NEW."userId";
    
    -- Update market pools
    IF NEW.side = 'YES' THEN
        UPDATE markets SET "yesPool" = "yesPool" + NEW.amount WHERE id = NEW."marketId";
    ELSE
        UPDATE markets SET "noPool" = "noPool" + NEW.amount WHERE id = NEW."marketId";
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for bet insertions
CREATE TRIGGER update_user_stats_trigger
    AFTER INSERT ON bets
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Function to update markets created count
CREATE OR REPLACE FUNCTION update_markets_created()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET "marketsCreated" = "marketsCreated" + 1 WHERE id = NEW."createdBy";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for market creation
CREATE TRIGGER update_markets_created_trigger
    AFTER INSERT ON markets
    FOR EACH ROW
    EXECUTE FUNCTION update_markets_created();

-- ============================================================================
-- 13. UPDATE EXISTING USER STATISTICS
-- ============================================================================

-- Update user statistics based on existing bets and markets
UPDATE users SET 
    "totalBets" = (SELECT COUNT(*) FROM bets WHERE "userId" = users.id),
    "totalWagered" = (SELECT COALESCE(SUM(amount), 0) FROM bets WHERE "userId" = users.id),
    "marketsCreated" = (SELECT COUNT(*) FROM markets WHERE "createdBy" = users.id);

-- ============================================================================
-- 14. VERIFICATION
-- ============================================================================

SELECT 'DATABASE SETUP COMPLETE - PRISMA SYNC!' as status;

SELECT 'Summary:' as info;
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Markets:', COUNT(*) FROM markets
UNION ALL
SELECT 'FOMO Markets:', COUNT(*) FROM fomo_markets
UNION ALL
SELECT 'Bets:', COUNT(*) FROM bets
UNION ALL
SELECT 'Action Logs:', COUNT(*) FROM action_logs
UNION ALL
SELECT 'Config:', COUNT(*) FROM config;

SELECT '✅ Database is now synced with Prisma schema' as sync_status;
SELECT '✅ Added leaderboard fields to users table' as leaderboard_ready;
SELECT '✅ Added image fields to markets and fomo_markets' as images_ready;
SELECT '✅ Sample data loaded with realistic values' as data_ready;
SELECT '✅ Wallet authentication should now work!' as auth_ready;
