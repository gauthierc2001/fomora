-- ============================================================================
-- COMPLETE FOMORA DATABASE SETUP FOR SUPABASE
-- This script creates everything needed for the full Fomora app including:
-- - User creation and leaderboard functionality
-- - Market creation with images
-- - FOMO markets
-- - Betting system
-- - All sample data matching local storage version
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
-- 2. CREATE ENUMS
-- ============================================================================
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "MarketStatus" AS ENUM ('OPEN', 'CLOSED', 'RESOLVED', 'CANCELLED');
CREATE TYPE "BetSide" AS ENUM ('YES', 'NO');
CREATE TYPE "Resolution" AS ENUM ('YES', 'NO', 'CANCELLED');
CREATE TYPE "ActionType" AS ENUM ('CONNECT', 'CREDITS', 'CREATE_MARKET', 'BET', 'RESOLVE', 'CANCEL', 'LOGIN', 'ADMIN_ACTION');

-- ============================================================================
-- 3. CREATE TABLES WITH ALL REQUIRED FIELDS
-- ============================================================================

-- Enhanced users table with leaderboard fields
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipHash" TEXT,
    "pointsBalance" INTEGER NOT NULL DEFAULT 0,
    "creditedInitial" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "displayName" TEXT,
    "profilePicture" TEXT,
    "totalBets" INTEGER NOT NULL DEFAULT 0,
    "totalWagered" INTEGER NOT NULL DEFAULT 0,
    "marketsCreated" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Enhanced markets table with image field
CREATE TABLE "markets" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "image" TEXT,
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

-- Bets table
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

-- Action logs table
CREATE TABLE "action_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "ActionType" NOT NULL,
    "metadata" JSONB,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_logs_pkey" PRIMARY KEY ("id")
);

-- Config table
CREATE TABLE "config" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "config_pkey" PRIMARY KEY ("key")
);

-- Enhanced FOMO markets table with image field
CREATE TABLE "fomo_markets" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "image" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "yesPool" INTEGER NOT NULL DEFAULT 0,
    "noPool" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" INTEGER NOT NULL DEFAULT 0,
    "participants" INTEGER NOT NULL DEFAULT 0,
    "trending" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'fomo-system',

    CONSTRAINT "fomo_markets_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
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
-- 5. ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================
ALTER TABLE "markets" ADD CONSTRAINT "markets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bets" ADD CONSTRAINT "bets_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bets" ADD CONSTRAINT "bets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "action_logs" ADD CONSTRAINT "action_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- 6. INSERT SYSTEM USERS AND CONFIGURATION
-- ============================================================================

-- System user for automated markets
INSERT INTO "users" ("id", "walletAddress", "role", "pointsBalance", "creditedInitial", "displayName", "totalBets", "totalWagered", "marketsCreated") 
VALUES ('system_user_001', '0x0000000000000000000000000000000000000000', 'ADMIN', 1000000, true, 'System', 0, 0, 0);

-- FOMO system user
INSERT INTO "users" ("id", "walletAddress", "role", "pointsBalance", "creditedInitial", "displayName", "totalBets", "totalWagered", "marketsCreated") 
VALUES ('fomo_system_001', '0x0000000000000000000000000000000000000001', 'ADMIN', 1000000, true, 'FOMO System', 0, 0, 0);

-- Admin user (change this wallet address to yours)
INSERT INTO "users" ("id", "walletAddress", "role", "pointsBalance", "creditedInitial", "displayName", "totalBets", "totalWagered", "marketsCreated") 
VALUES ('admin_user_001', '0x1234567890123456789012345678901234567890', 'ADMIN', 1000000, true, 'Admin', 0, 0, 0);

-- Sample active users with realistic stats
INSERT INTO "users" ("id", "walletAddress", "pointsBalance", "creditedInitial", "displayName", "totalBets", "totalWagered", "marketsCreated") VALUES
('user_001', '0xabcdef1234567890abcdef1234567890abcdef12', 8500, true, 'CryptoWhale', 25, 12500, 2),
('user_002', '0x9876543210987654321098765432109876543210', 6200, true, 'DiamondHands', 18, 8900, 1),
('user_003', '0x1111222233334444555566667777888899990000', 9800, true, 'MoonShot', 32, 15600, 3),
('user_004', '0x2222333344445555666677778888999900001111', 4300, true, 'HODLer', 12, 5400, 0),
('user_005', '0x3333444455556666777788889999000011112222', 7100, true, 'DegenTrader', 21, 9800, 1),
('user_006', '0x4444555566667777888899990000111122223333', 5900, true, 'ApeStrong', 15, 7200, 0),
('user_007', '0x5555666677778888999900001111222233334444', 3800, true, 'PaperHands', 8, 3200, 0),
('user_008', '0x6666777788889999000011112222333344445555', 11200, true, 'WhaleWatcher', 45, 22100, 4),
('user_009', '0x7777888899990000111122223333444455556666', 2900, true, 'FOMOKing', 6, 2100, 0),
('user_010', '0x8888999900001111222233334444555566667777', 6800, true, 'CryptoSage', 19, 8500, 2);

-- Configuration values
INSERT INTO "config" ("key", "value") VALUES
('initial_credits', '1000'),
('market_create_fee', '100'),
('bet_fee_percentage', '2'),
('max_bet_amount', '10000'),
('min_bet_amount', '10'),
('max_markets_per_user', '3');

-- ============================================================================
-- 7. INSERT REALISTIC PREDICTION MARKETS WITH IMAGES
-- ============================================================================

INSERT INTO "markets" ("id", "slug", "question", "description", "category", "image", "createdBy", "status", "closesAt", "yesPool", "noPool", "createFee") VALUES
('market_crypto_btc_001', 'will-bitcoin-reach-70000-this-week', 'Will Bitcoin reach $70,000 this week?', 'Bitcoin is currently trading around $65,000. Technical analysis suggests a potential breakout above the $70K resistance level. Recent institutional adoption and ETF inflows could provide the momentum needed for this milestone.', 'Crypto', 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', 'system_user_001', 'OPEN', NOW() + INTERVAL '7 days', 4200, 2800, 100),

('market_crypto_eth_001', 'will-ethereum-outperform-bitcoin-this-month', 'Will Ethereum outperform Bitcoin this month?', 'ETH has been showing strong fundamentals with increased DeFi activity and upcoming network upgrades. The ETH/BTC ratio is at a critical level. Will Ethereum finally break out against Bitcoin in the next 30 days?', 'Crypto', 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', 'system_user_001', 'OPEN', NOW() + INTERVAL '30 days', 3100, 2900, 100),

('market_meme_doge_001', 'will-dogecoin-pump-50-percent-this-week', 'Will Dogecoin pump 50% this week?', 'DOGE is showing signs of life with increased social media mentions and whale activity. Elon Musk has been quiet lately, but the community is buzzing. Can the original meme coin deliver a classic 50%+ pump?', 'Memes', 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', 'system_user_001', 'OPEN', NOW() + INTERVAL '7 days', 5600, 1400, 100),

('market_tech_ai_001', 'will-chatgpt-have-major-outage-this-month', 'Will ChatGPT have a major outage this month?', 'AI services are under unprecedented load with millions of users. OpenAI has experienced several outages recently. Will they face another significant downtime event (>2 hours) in the next 30 days?', 'Technology', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop', 'system_user_001', 'OPEN', NOW() + INTERVAL '30 days', 1800, 4200, 100),

('market_social_elon_001', 'will-elon-musk-tweet-about-crypto-today', 'Will Elon Musk tweet about crypto today?', 'Elon''s crypto tweets have historically moved markets instantly. He''s been focusing on X and Tesla lately, but crypto Twitter is always watching. Will he mention Bitcoin, Dogecoin, or any crypto in the next 24 hours?', 'Social Media', 'https://images.unsplash.com/photo-1634912314704-c646c586b131?w=400&h=300&fit=crop', 'system_user_001', 'OPEN', NOW() + INTERVAL '1 day', 3800, 2200, 100),

('market_defi_tvl_001', 'will-defi-tvl-exceed-100b-this-quarter', 'Will DeFi TVL exceed $100B this quarter?', 'Total Value Locked in DeFi protocols is currently around $85B. New protocols are launching, yields are attractive, and institutional interest is growing. Can DeFi break the $100B milestone before Q1 ends?', 'DeFi', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop', 'user_003', 'OPEN', NOW() + INTERVAL '90 days', 2700, 3300, 100),

('market_nft_blur_001', 'will-blur-overtake-opensea-volume-this-month', 'Will Blur overtake OpenSea in trading volume this month?', 'The NFT marketplace war is heating up. Blur has been gaining ground with their aggressive rewards program and pro-trader features. Can they finally dethrone OpenSea as the #1 NFT marketplace by volume?', 'NFTs', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop', 'user_008', 'OPEN', NOW() + INTERVAL '30 days', 2400, 3600, 100),

('market_gaming_gta6_001', 'will-gta6-release-date-be-announced-this-year', 'Will GTA 6 release date be announced this year?', 'The most anticipated game ever. Rockstar has been silent for years, but rumors are swirling about a major announcement. Will they finally give us an official release date for Grand Theft Auto 6 in 2024?', 'Gaming', 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop', 'user_010', 'OPEN', NOW() + INTERVAL '60 days', 4100, 1900, 100);

-- ============================================================================
-- 8. INSERT FOMO MARKETS WITH IMAGES (SHORT-TERM HIGH-ENERGY)
-- ============================================================================

INSERT INTO "fomo_markets" ("id", "question", "description", "category", "image", "status", "closesAt", "yesPool", "noPool", "totalVolume", "participants", "trending", "slug", "createdBy") VALUES
('fomo_001', 'Will Bitcoin move $1000+ in the next 15 minutes?', 'Pure FOMO volatility - anything can happen in crypto. Current market conditions are perfect for explosive moves. Whales are active and retail is watching.', 'FOMO', 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', 'OPEN', NOW() + INTERVAL '15 minutes', 2100, 2900, 5000, 32, true, 'bitcoin-move-1000-15-minutes', 'fomo_system_001'),

('fomo_002', 'Will any meme coin pump 1000% in the next hour?', 'Peak degeneracy hours for astronomical meme coin gains. New tokens are launching every minute and social media is buzzing with the next moonshot.', 'Hype', 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg', 'OPEN', NOW() + INTERVAL '1 hour', 4200, 1800, 6000, 45, true, 'meme-coin-pump-1000-percent-hour', 'fomo_system_001'),

('fomo_003', 'Will ''WAGMI'' trend on crypto Twitter in 30 minutes?', 'Classic crypto FOMO expression during market pumps. The community is feeling bullish and social sentiment is heating up. We''re All Gonna Make It!', 'FOMO', 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '30 minutes', 1900, 2100, 4000, 28, false, 'wagmi-trend-crypto-twitter-30-minutes', 'fomo_system_001'),

('fomo_004', 'Will Elon tweet about Dogecoin today?', 'Classic FOMO trigger - Elon''s crypto tweets move markets instantly. He''s been quiet on crypto lately, but that just means he''s due for a DOGE mention.', 'FOMO', 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', 'OPEN', NOW() + INTERVAL '24 hours', 5200, 2800, 8000, 58, true, 'elon-tweet-dogecoin-today', 'fomo_system_001'),

('fomo_005', 'Will someone buy an NFT for over $100K in next 12 hours?', 'Peak NFT FOMO territory with whale purchases. Blue chip collections are seeing renewed interest and FOMO buyers are back in the market.', 'FOMO', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '12 hours', 2200, 3800, 6000, 35, false, 'nft-purchase-100k-12-hours', 'fomo_system_001'),

('fomo_006', 'Will ''To the moon'' get tweeted 1000+ times in 30 minutes?', 'Peak FOMO expression during explosive price action. Social media sentiment is building and the moon boys are getting ready to spam.', 'Viral', 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '30 minutes', 3100, 1900, 5000, 41, true, 'to-the-moon-tweeted-1000-times-30-minutes', 'fomo_system_001'),

('fomo_007', 'Will this FOMO market get 100+ bets in 1 hour?', 'Meta FOMO - betting on the FOMO of betting on FOMO. The ultimate recursive prediction market for peak degeneracy.', 'Meta', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '1 hour', 1800, 2200, 4000, 22, false, 'fomo-market-100-bets-1-hour', 'fomo_system_001'),

('fomo_008', 'Will any crypto influencer claim ''not financial advice'' 50+ times today?', 'The more disclaimers, the more FOMO content incoming. Influencers are pumping their bags and covering their legal bases.', 'Buzz', 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '24 hours', 2600, 2400, 5000, 33, false, 'crypto-influencer-not-financial-advice-50-times', 'fomo_system_001'),

('fomo_009', 'Will someone livestream buying meme coins for 12 hours straight?', 'Peak degeneracy content creation meets FOMO trading. Streamers are doing anything for views and the meme coin casino is open 24/7.', 'Hype', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '12 hours', 1700, 3300, 5000, 29, true, 'livestream-buying-meme-coins-12-hours', 'fomo_system_001'),

('fomo_010', 'Will ''number go up'' technology trend globally in 30 minutes?', 'Classic crypto FOMO meme reaching normie territory. When the normies start using our memes, peak FOMO is near.', 'Viral', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '30 minutes', 2000, 2000, 4000, 25, false, 'number-go-up-technology-trend-30-minutes', 'fomo_system_001'),

('fomo_011', 'Will any celebrity post about crypto in the next hour?', 'Celebrity FOMO posts can trigger massive market movements. A-listers are always looking for the next trend to jump on.', 'Buzz', 'https://images.unsplash.com/photo-1634912314704-c646c586b131?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '1 hour', 2300, 1700, 4000, 31, false, 'celebrity-post-crypto-next-hour', 'fomo_system_001'),

('fomo_012', 'Will ''Diamond Hands'' get more mentions than ''Paper Hands'' today?', 'Daily battle of crypto trading memes on social media. The eternal struggle between HODLers and panic sellers.', 'Memes', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '24 hours', 3400, 1600, 5000, 38, true, 'diamond-hands-vs-paper-hands-today', 'fomo_system_001'),

('fomo_013', 'Will someone claim they ''bought the top'' today?', 'Peak FOMO admission - the moment you realize you FOMO''d in at the worst possible time. The ultimate crypto rite of passage.', 'Buzz', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '24 hours', 2800, 1200, 4000, 27, false, 'someone-claim-bought-the-top-today', 'fomo_system_001'),

('fomo_014', 'Will ''HODL until I die'' be tweeted 500+ times in 3 hours?', 'Ultimate commitment FOMO during market stress. When the going gets tough, the tough start HODLing harder.', 'Viral', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '3 hours', 1900, 2100, 4000, 24, true, 'hodl-until-die-tweeted-500-times-3-hours', 'fomo_system_001'),

('fomo_015', 'Will someone rage-delete their trading app today?', 'Peak emotional FOMO reaction to market movements. When the losses hit too hard, the delete button becomes very tempting.', 'Hype', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', 'OPEN', NOW() + INTERVAL '24 hours', 2500, 1500, 4000, 26, false, 'rage-delete-trading-app-today', 'fomo_system_001');

-- ============================================================================
-- 9. INSERT REALISTIC BETS WITH PROPER DISTRIBUTION
-- ============================================================================

INSERT INTO "bets" ("id", "marketId", "userId", "side", "amount", "fee") VALUES
-- Bitcoin $70K market bets
('bet_001', 'market_crypto_btc_001', 'user_001', 'YES', 800, 16),
('bet_002', 'market_crypto_btc_001', 'user_003', 'YES', 1200, 24),
('bet_003', 'market_crypto_btc_001', 'user_008', 'YES', 1500, 30),
('bet_004', 'market_crypto_btc_001', 'user_002', 'NO', 600, 12),
('bet_005', 'market_crypto_btc_001', 'user_005', 'NO', 500, 10),

-- Ethereum vs Bitcoin market bets
('bet_006', 'market_crypto_eth_001', 'user_003', 'YES', 900, 18),
('bet_007', 'market_crypto_eth_001', 'user_010', 'YES', 700, 14),
('bet_008', 'market_crypto_eth_001', 'user_004', 'NO', 400, 8),
('bet_009', 'market_crypto_eth_001', 'user_006', 'NO', 800, 16),

-- Dogecoin pump market bets
('bet_010', 'market_meme_doge_001', 'user_001', 'YES', 1000, 20),
('bet_011', 'market_meme_doge_001', 'user_005', 'YES', 1200, 24),
('bet_012', 'market_meme_doge_001', 'user_008', 'YES', 2000, 40),
('bet_013', 'market_meme_doge_001', 'user_007', 'NO', 300, 6),

-- ChatGPT outage market bets
('bet_014', 'market_tech_ai_001', 'user_002', 'NO', 1500, 30),
('bet_015', 'market_tech_ai_001', 'user_009', 'NO', 800, 16),
('bet_016', 'market_tech_ai_001', 'user_004', 'YES', 200, 4),

-- Elon crypto tweet market bets
('bet_017', 'market_social_elon_001', 'user_003', 'YES', 1100, 22),
('bet_018', 'market_social_elon_001', 'user_006', 'YES', 900, 18),
('bet_019', 'market_social_elon_001', 'user_010', 'YES', 1300, 26),
('bet_020', 'market_social_elon_001', 'user_007', 'NO', 400, 8),

-- User-created market bets
('bet_021', 'market_defi_tvl_001', 'user_001', 'YES', 600, 12),
('bet_022', 'market_defi_tvl_001', 'user_008', 'NO', 1000, 20),
('bet_023', 'market_nft_blur_001', 'user_005', 'NO', 800, 16),
('bet_024', 'market_gaming_gta6_001', 'user_002', 'YES', 1200, 24);

-- ============================================================================
-- 10. INSERT ACTION LOGS FOR ACTIVITY TRACKING
-- ============================================================================

INSERT INTO "action_logs" ("id", "userId", "type", "metadata") VALUES
('log_001', 'user_001', 'CONNECT', '{"walletAddress": "0xabcdef1234567890abcdef1234567890abcdef12"}'),
('log_002', 'user_001', 'CREDITS', '{"amount": 1000, "reason": "initial_signup"}'),
('log_003', 'user_001', 'BET', '{"marketId": "market_crypto_btc_001", "side": "YES", "amount": 800}'),
('log_004', 'user_002', 'CONNECT', '{"walletAddress": "0x9876543210987654321098765432109876543210"}'),
('log_005', 'user_002', 'BET', '{"marketId": "market_crypto_btc_001", "side": "NO", "amount": 600}'),
('log_006', 'user_003', 'CREATE_MARKET', '{"marketId": "market_defi_tvl_001", "question": "Will DeFi TVL exceed $100B this quarter?"}'),
('log_007', 'user_003', 'BET', '{"marketId": "market_crypto_eth_001", "side": "YES", "amount": 900}'),
('log_008', 'user_008', 'CREATE_MARKET', '{"marketId": "market_nft_blur_001", "question": "Will Blur overtake OpenSea in trading volume this month?"}'),
('log_009', 'user_010', 'CREATE_MARKET', '{"marketId": "market_gaming_gta6_001", "question": "Will GTA 6 release date be announced this year?"}'),
('log_010', 'user_005', 'BET', '{"marketId": "market_meme_doge_001", "side": "YES", "amount": 1200}');

-- ============================================================================
-- 11. CREATE FUNCTIONS TO UPDATE USER STATISTICS
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
-- 12. UPDATE EXISTING USER STATISTICS BASED ON CURRENT DATA
-- ============================================================================

-- Update user statistics based on existing bets and markets
UPDATE users SET 
    "totalBets" = (SELECT COUNT(*) FROM bets WHERE "userId" = users.id),
    "totalWagered" = (SELECT COALESCE(SUM(amount), 0) FROM bets WHERE "userId" = users.id),
    "marketsCreated" = (SELECT COUNT(*) FROM markets WHERE "createdBy" = users.id);

-- ============================================================================
-- 13. VERIFICATION AND SUMMARY
-- ============================================================================

-- Show setup summary
SELECT 'FOMORA DATABASE SETUP COMPLETE!' as status;

SELECT 'Summary:' as info;
SELECT 'Users created:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Markets created:', COUNT(*) FROM markets
UNION ALL
SELECT 'FOMO Markets created:', COUNT(*) FROM fomo_markets
UNION ALL
SELECT 'Bets placed:', COUNT(*) FROM bets
UNION ALL
SELECT 'Action logs:', COUNT(*) FROM action_logs
UNION ALL
SELECT 'Config entries:', COUNT(*) FROM config;

-- Show top users by points (leaderboard preview)
SELECT 'Top 5 Users by Points:' as leaderboard_preview;
SELECT 
    "displayName",
    "pointsBalance",
    "totalBets",
    "totalWagered",
    "marketsCreated"
FROM users 
WHERE role = 'USER'
ORDER BY "pointsBalance" DESC, "createdAt" ASC 
LIMIT 5;

-- Show active markets
SELECT 'Active Markets:' as active_markets;
SELECT 
    question,
    category,
    "yesPool",
    "noPool",
    ("yesPool" + "noPool") as total_volume
FROM markets 
WHERE status = 'OPEN'
ORDER BY ("yesPool" + "noPool") DESC
LIMIT 5;

-- Show trending FOMO markets
SELECT 'Trending FOMO Markets:' as trending_fomo;
SELECT 
    question,
    category,
    "totalVolume",
    participants,
    trending
FROM fomo_markets 
WHERE trending = true
ORDER BY "totalVolume" DESC
LIMIT 5;

SELECT '🚀 Your Fomora app is ready to go! Users can now:' as ready;
SELECT '✅ Connect wallets and get authenticated' as feature_1;
SELECT '✅ Create prediction markets with images' as feature_2;
SELECT '✅ Place bets on markets and FOMO markets' as feature_3;
SELECT '✅ View leaderboard with real rankings' as feature_4;
SELECT '✅ Track activity and statistics' as feature_5;
SELECT '✅ All data persists in Supabase database' as feature_6;
