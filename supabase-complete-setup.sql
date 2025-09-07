-- COMPLETE FOMORA DATABASE SETUP FOR SUPABASE
-- Run this entire script in Supabase SQL Editor
-- This will create all tables, populate with sample data, and set up everything needed

-- ============================================================================
-- 1. DROP EXISTING TABLES (if they exist) TO START FRESH
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
-- 2. CREATE ENUMS
-- ============================================================================
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "MarketStatus" AS ENUM ('OPEN', 'CLOSED', 'RESOLVED', 'CANCELLED');
CREATE TYPE "BetSide" AS ENUM ('YES', 'NO');
CREATE TYPE "Resolution" AS ENUM ('YES', 'NO', 'CANCELLED');
CREATE TYPE "ActionType" AS ENUM ('CONNECT', 'CREDITS', 'CREATE_MARKET', 'BET', 'RESOLVE', 'CANCEL', 'LOGIN', 'ADMIN_ACTION');

-- ============================================================================
-- 3. CREATE TABLES
-- ============================================================================

-- Create users table
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

-- Create markets table
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

-- Create bets table
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

-- Create action_logs table
CREATE TABLE "action_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "ActionType" NOT NULL,
    "metadata" JSONB,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_logs_pkey" PRIMARY KEY ("id")
);

-- Create config table
CREATE TABLE "config" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "config_pkey" PRIMARY KEY ("key")
);

-- Create fomo_markets table
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
-- 4. CREATE INDEXES
-- ============================================================================
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");
CREATE UNIQUE INDEX "markets_slug_key" ON "markets"("slug");
CREATE UNIQUE INDEX "fomo_markets_slug_key" ON "fomo_markets"("slug");

-- Performance indexes
CREATE INDEX "markets_status_idx" ON "markets"("status");
CREATE INDEX "markets_category_idx" ON "markets"("category");
CREATE INDEX "markets_createdAt_idx" ON "markets"("createdAt");
CREATE INDEX "markets_closesAt_idx" ON "markets"("closesAt");
CREATE INDEX "bets_marketId_idx" ON "bets"("marketId");
CREATE INDEX "bets_userId_idx" ON "bets"("userId");
CREATE INDEX "fomo_markets_status_idx" ON "fomo_markets"("status");
CREATE INDEX "fomo_markets_trending_idx" ON "fomo_markets"("trending");

-- ============================================================================
-- 5. ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================
ALTER TABLE "markets" ADD CONSTRAINT "markets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bets" ADD CONSTRAINT "bets_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bets" ADD CONSTRAINT "bets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "action_logs" ADD CONSTRAINT "action_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- 6. INSERT SAMPLE DATA
-- ============================================================================

-- Insert system user (required for markets)
INSERT INTO "users" ("id", "walletAddress", "role", "pointsBalance", "creditedInitial") 
VALUES ('system_user_001', '0x0000000000000000000000000000000000000000', 'ADMIN', 1000000, true);

-- Insert admin user (you can change this wallet address to yours)
INSERT INTO "users" ("id", "walletAddress", "role", "pointsBalance", "creditedInitial") 
VALUES ('admin_user_001', '0x1234567890123456789012345678901234567890', 'ADMIN', 1000000, true);

-- Insert sample regular users
INSERT INTO "users" ("id", "walletAddress", "pointsBalance", "creditedInitial") VALUES
('user_001', '0xabcdef1234567890abcdef1234567890abcdef12', 5000, true),
('user_002', '0x9876543210987654321098765432109876543210', 3500, true),
('user_003', '0x1111222233334444555566667777888899990000', 7500, true);

-- Insert config values
INSERT INTO "config" ("key", "value") VALUES
('initial_credits', '1000'),
('market_create_fee', '100'),
('bet_fee_percentage', '2'),
('max_bet_amount', '10000'),
('min_bet_amount', '10');

-- ============================================================================
-- 7. INSERT SAMPLE MARKETS
-- ============================================================================

-- Regular prediction markets
INSERT INTO "markets" ("id", "slug", "question", "description", "category", "createdBy", "status", "closesAt", "yesPool", "noPool", "createFee") VALUES
('market_crypto_btc_001', 'will-bitcoin-reach-70000-this-week', 'Will Bitcoin reach $70,000 this week?', 'Bitcoin is currently trading around $65,000. Will it break the $70K resistance level in the next 7 days?', 'Crypto', 'system_user_001', 'OPEN', NOW() + INTERVAL '7 days', 2500, 1800, 100),
('market_crypto_eth_001', 'will-ethereum-outperform-bitcoin-this-month', 'Will Ethereum outperform Bitcoin this month?', 'ETH vs BTC performance comparison over the next 30 days. Which will have better percentage gains?', 'Crypto', 'system_user_001', 'OPEN', NOW() + INTERVAL '30 days', 1900, 2100, 100),
('market_meme_doge_001', 'will-dogecoin-pump-50-percent-this-week', 'Will Dogecoin pump 50% this week?', 'DOGE is showing signs of life. Will it deliver a classic meme coin pump of 50%+ in the next week?', 'Memes', 'system_user_001', 'OPEN', NOW() + INTERVAL '7 days', 3200, 1600, 100),
('market_tech_ai_001', 'will-chatgpt-have-major-outage-this-month', 'Will ChatGPT have a major outage this month?', 'AI services are under heavy load. Will OpenAI experience significant downtime in the next 30 days?', 'Technology', 'system_user_001', 'OPEN', NOW() + INTERVAL '30 days', 1200, 2800, 100),
('market_social_elon_001', 'will-elon-musk-tweet-about-crypto-today', 'Will Elon Musk tweet about crypto today?', 'Elon''s crypto tweets always move markets. Will he mention any cryptocurrency in the next 24 hours?', 'Social Media', 'system_user_001', 'OPEN', NOW() + INTERVAL '1 day', 2800, 1400, 100);

-- ============================================================================
-- 8. INSERT FOMO MARKETS (SHORT-TERM HIGH-ENERGY MARKETS)
-- ============================================================================

INSERT INTO "fomo_markets" ("id", "question", "description", "category", "status", "closesAt", "yesPool", "noPool", "totalVolume", "participants", "trending", "slug") VALUES
('fomo_001', 'Will Bitcoin move $1000+ in the next 15 minutes?', 'Pure FOMO volatility - anything can happen in crypto.', 'FOMO', 'OPEN', NOW() + INTERVAL '15 minutes', 1500, 2500, 4000, 25, true, 'bitcoin-move-1000-15-minutes'),
('fomo_002', 'Will any meme coin pump 1000% in the next hour?', 'Peak degeneracy hours for astronomical meme coin gains.', 'Hype', 'OPEN', NOW() + INTERVAL '1 hour', 3200, 1800, 5000, 35, true, 'meme-coin-pump-1000-percent-hour'),
('fomo_003', 'Will ''WAGMI'' trend on crypto Twitter in 30 minutes?', 'Classic crypto FOMO expression during market pumps.', 'FOMO', 'OPEN', NOW() + INTERVAL '30 minutes', 2100, 1900, 4000, 28, false, 'wagmi-trend-crypto-twitter-30-minutes'),
('fomo_004', 'Will Elon tweet about Dogecoin today?', 'Classic FOMO trigger - Elon''s crypto tweets move markets instantly.', 'FOMO', 'OPEN', NOW() + INTERVAL '24 hours', 4500, 2500, 7000, 45, true, 'elon-tweet-dogecoin-today'),
('fomo_005', 'Will someone buy an NFT for over $100K in next 12 hours?', 'Peak NFT FOMO territory with whale purchases.', 'FOMO', 'OPEN', NOW() + INTERVAL '12 hours', 1800, 3200, 5000, 32, false, 'nft-purchase-100k-12-hours'),
('fomo_006', 'Will ''To the moon'' get tweeted 1000+ times in 30 minutes?', 'Peak FOMO expression during explosive price action.', 'Viral', 'OPEN', NOW() + INTERVAL '30 minutes', 2800, 1200, 4000, 22, true, 'to-the-moon-tweeted-1000-times-30-minutes'),
('fomo_007', 'Will this FOMO market get 100+ bets in 1 hour?', 'Meta FOMO - betting on the FOMO of betting on FOMO.', 'Meta', 'OPEN', NOW() + INTERVAL '1 hour', 1600, 2400, 4000, 18, false, 'fomo-market-100-bets-1-hour'),
('fomo_008', 'Will any crypto influencer claim ''not financial advice'' 50+ times today?', 'The more disclaimers, the more FOMO content incoming.', 'Buzz', 'OPEN', NOW() + INTERVAL '24 hours', 2200, 2800, 5000, 28, false, 'crypto-influencer-not-financial-advice-50-times'),
('fomo_009', 'Will someone livestream buying meme coins for 12 hours straight?', 'Peak degeneracy content creation meets FOMO trading.', 'Hype', 'OPEN', NOW() + INTERVAL '12 hours', 1400, 3600, 5000, 24, true, 'livestream-buying-meme-coins-12-hours'),
('fomo_010', 'Will ''number go up'' technology trend globally in 30 minutes?', 'Classic crypto FOMO meme reaching normie territory.', 'Viral', 'OPEN', NOW() + INTERVAL '30 minutes', 1900, 2100, 4000, 19, false, 'number-go-up-technology-trend-30-minutes');

-- ============================================================================
-- 9. INSERT SAMPLE BETS
-- ============================================================================

INSERT INTO "bets" ("id", "marketId", "userId", "side", "amount", "fee") VALUES
('bet_001', 'market_crypto_btc_001', 'user_001', 'YES', 500, 10),
('bet_002', 'market_crypto_btc_001', 'user_002', 'NO', 300, 6),
('bet_003', 'market_crypto_eth_001', 'user_001', 'YES', 750, 15),
('bet_004', 'market_meme_doge_001', 'user_003', 'YES', 1000, 20),
('bet_005', 'market_tech_ai_001', 'user_002', 'NO', 400, 8),
('bet_006', 'market_social_elon_001', 'user_003', 'YES', 600, 12);

-- ============================================================================
-- 10. INSERT ACTION LOGS
-- ============================================================================

INSERT INTO "action_logs" ("id", "userId", "type", "metadata") VALUES
('log_001', 'user_001', 'CONNECT', '{"walletAddress": "0xabcdef1234567890abcdef1234567890abcdef12"}'),
('log_002', 'user_001', 'CREDITS', '{"amount": 1000, "reason": "initial_signup"}'),
('log_003', 'user_001', 'BET', '{"marketId": "market_crypto_btc_001", "side": "YES", "amount": 500}'),
('log_004', 'user_002', 'CONNECT', '{"walletAddress": "0x9876543210987654321098765432109876543210"}'),
('log_005', 'user_002', 'BET', '{"marketId": "market_crypto_btc_001", "side": "NO", "amount": 300}'),
('log_006', 'user_003', 'CREATE_MARKET', '{"marketId": "market_meme_doge_001", "question": "Will Dogecoin pump 50% this week?"}');

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

-- Verify the setup
SELECT 'Setup Complete! Here is a summary:' as status;
SELECT 'Users created:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Markets created:', COUNT(*) FROM markets
UNION ALL
SELECT 'FOMO Markets created:', COUNT(*) FROM fomo_markets
UNION ALL
SELECT 'Bets created:', COUNT(*) FROM bets
UNION ALL
SELECT 'Action logs created:', COUNT(*) FROM action_logs
UNION ALL
SELECT 'Config entries:', COUNT(*) FROM config;

-- Show sample data
SELECT 'Sample Markets:' as info;
SELECT id, question, category, status, "yesPool", "noPool" FROM markets LIMIT 3;

SELECT 'Sample FOMO Markets:' as info;
SELECT id, question, category, status, "yesPool", "noPool" FROM fomo_markets LIMIT 3;

SELECT 'Sample Users:' as info;
SELECT id, "walletAddress", role, "pointsBalance" FROM users;
