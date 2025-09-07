-- ADDITIONAL MARKETS FOR FOMORA
-- Run this after the main setup if you want more market variety
-- This adds 20+ more diverse markets across different categories

-- ============================================================================
-- CRYPTO MARKETS WITH REALISTIC SCENARIOS
-- ============================================================================

INSERT INTO "markets" ("id", "slug", "question", "description", "category", "createdBy", "status", "closesAt", "yesPool", "noPool", "createFee") VALUES
('market_crypto_sol_001', 'will-solana-reach-200-this-month', 'Will Solana reach $200 this month?', 'SOL is showing strong momentum. Can it break the $200 psychological resistance in the next 30 days?', 'Crypto', 'system_user_001', 'OPEN', NOW() + INTERVAL '30 days', 2800, 2200, 100),
('market_crypto_ada_001', 'will-cardano-announce-major-partnership', 'Will Cardano announce a major partnership this quarter?', 'ADA ecosystem development continues. Will they land a big corporate partnership in Q4?', 'Crypto', 'system_user_001', 'OPEN', NOW() + INTERVAL '90 days', 1600, 3400, 100),
('market_defi_tvl_001', 'will-defi-tvl-exceed-100b-this-year', 'Will DeFi TVL exceed $100B this year?', 'Total Value Locked in DeFi protocols currently around $80B. Can it hit $100B before year end?', 'DeFi', 'system_user_001', 'OPEN', NOW() + INTERVAL '60 days', 3500, 1500, 100),
('market_nft_blur_001', 'will-blur-overtake-opensea-volume-this-month', 'Will Blur overtake OpenSea in trading volume this month?', 'NFT marketplace competition heating up. Can Blur maintain its momentum vs OpenSea?', 'NFTs', 'system_user_001', 'OPEN', NOW() + INTERVAL '30 days', 2100, 2900, 100);

-- ============================================================================
-- MEME COIN MADNESS
-- ============================================================================

INSERT INTO "markets" ("id", "slug", "question", "description", "category", "createdBy", "status", "closesAt", "yesPool", "noPool", "createFee") VALUES
('market_meme_shib_001', 'will-shiba-inu-burn-1-trillion-tokens', 'Will Shiba Inu burn 1 trillion tokens this quarter?', 'SHIB community pushing for massive token burns. Can they hit the 1T milestone?', 'Memes', 'system_user_001', 'OPEN', NOW() + INTERVAL '90 days', 4200, 800, 100),
('market_meme_pepe_001', 'will-pepe-coin-get-binance-listing', 'Will PEPE coin get listed on Binance this year?', 'The frog meme coin that took over crypto. Will Binance finally give it the nod?', 'Memes', 'system_user_001', 'OPEN', NOW() + INTERVAL '60 days', 3800, 1200, 100),
('market_meme_bonk_001', 'will-bonk-become-top-10-meme-coin', 'Will BONK become a top 10 meme coin by market cap?', 'Solana''s favorite dog coin making waves. Can it crack the meme coin top 10?', 'Memes', 'system_user_001', 'OPEN', NOW() + INTERVAL '45 days', 2600, 2400, 100);

-- ============================================================================
-- TECH & AI PREDICTIONS
-- ============================================================================

INSERT INTO "markets" ("id", "slug", "question", "description", "category", "createdBy", "status", "closesAt", "yesPool", "noPool", "createFee") VALUES
('market_ai_gpt5_001', 'will-openai-announce-gpt5-this-year', 'Will OpenAI announce GPT-5 this year?', 'The AI race continues. Will OpenAI drop the next major model before 2025?', 'Technology', 'system_user_001', 'OPEN', NOW() + INTERVAL '60 days', 3200, 1800, 100),
('market_tech_apple_001', 'will-apple-announce-ai-chip-this-quarter', 'Will Apple announce a dedicated AI chip this quarter?', 'Apple''s AI strategy under scrutiny. Will they reveal custom AI silicon in Q4?', 'Technology', 'system_user_001', 'OPEN', NOW() + INTERVAL '90 days', 2400, 2600, 100),
('market_social_twitter_001', 'will-x-rebrand-back-to-twitter', 'Will X rebrand back to Twitter this year?', 'Elon''s X rebrand controversial. Will he reverse course and bring back the Twitter brand?', 'Social Media', 'system_user_001', 'OPEN', NOW() + INTERVAL '45 days', 1800, 3200, 100);

-- ============================================================================
-- FINANCE & ECONOMICS
-- ============================================================================

INSERT INTO "markets" ("id", "slug", "question", "description", "category", "createdBy", "status", "closesAt", "yesPool", "noPool", "createFee") VALUES
('market_fed_rates_001', 'will-fed-cut-rates-next-meeting', 'Will the Fed cut interest rates at the next meeting?', 'Economic uncertainty continues. Will the Federal Reserve lower rates to stimulate growth?', 'Finance', 'system_user_001', 'OPEN', NOW() + INTERVAL '30 days', 2700, 2300, 100),
('market_gold_price_001', 'will-gold-hit-2500-per-ounce', 'Will gold hit $2,500 per ounce this year?', 'Gold prices climbing amid economic uncertainty. Can it reach the $2,500 milestone?', 'Finance', 'system_user_001', 'OPEN', NOW() + INTERVAL '60 days', 3100, 1900, 100),
('market_recession_001', 'will-us-enter-recession-next-quarter', 'Will the US enter a recession next quarter?', 'Economic indicators mixed. Will Q1 2025 mark the start of a US recession?', 'Finance', 'system_user_001', 'OPEN', NOW() + INTERVAL '120 days', 2000, 3000, 100);

-- ============================================================================
-- SPORTS & ENTERTAINMENT
-- ============================================================================

INSERT INTO "markets" ("id", "slug", "question", "description", "category", "createdBy", "status", "closesAt", "yesPool", "noPool", "createFee") VALUES
('market_sports_nfl_001', 'will-any-nfl-team-go-undefeated', 'Will any NFL team go undefeated this season?', 'Perfect season watch continues. Can any team run the table in 2024?', 'Sports', 'system_user_001', 'OPEN', NOW() + INTERVAL '90 days', 800, 4200, 100),
('market_gaming_gta6_001', 'will-gta6-release-date-be-announced', 'Will GTA 6 release date be announced this year?', 'The most anticipated game ever. Will Rockstar finally give us a release date?', 'Gaming', 'system_user_001', 'OPEN', NOW() + INTERVAL '60 days', 3600, 1400, 100);

-- ============================================================================
-- MORE FOMO MARKETS (ULTRA SHORT-TERM)
-- ============================================================================

INSERT INTO "fomo_markets" ("id", "question", "description", "category", "status", "closesAt", "yesPool", "noPool", "totalVolume", "participants", "trending", "slug") VALUES
('fomo_011', 'Will any celebrity post about crypto in the next hour?', 'Celebrity FOMO posts can trigger massive market movements.', 'Buzz', 'OPEN', NOW() + INTERVAL '1 hour', 1800, 2200, 4000, 23, false, 'celebrity-post-crypto-next-hour'),
('fomo_012', 'Will ''Diamond Hands'' get more mentions than ''Paper Hands'' today?', 'Daily battle of crypto trading memes on social media.', 'Memes', 'OPEN', NOW() + INTERVAL '24 hours', 2500, 1500, 4000, 31, true, 'diamond-hands-vs-paper-hands-today'),
('fomo_013', 'Will someone claim they ''bought the top'' today?', 'Peak FOMO admission - the moment you realize you FOMO''d.', 'Buzz', 'OPEN', NOW() + INTERVAL '24 hours', 2100, 1900, 4000, 27, false, 'someone-claim-bought-the-top-today'),
('fomo_014', 'Will ''HODL until I die'' be tweeted 500+ times in 3 hours?', 'Ultimate commitment FOMO during market stress.', 'Viral', 'OPEN', NOW() + INTERVAL '3 hours', 1600, 2400, 4000, 21, true, 'hodl-until-die-tweeted-500-times-3-hours'),
('fomo_015', 'Will someone rage-delete their trading app today?', 'Peak emotional FOMO reaction to market movements.', 'Hype', 'OPEN', NOW() + INTERVAL '24 hours', 1900, 2100, 4000, 25, false, 'rage-delete-trading-app-today'),
('fomo_016', 'Will ''this time is different'' be said unironically 100+ times today?', 'Famous last words of peak FOMO cycles.', 'Buzz', 'OPEN', NOW() + INTERVAL '24 hours', 2200, 1800, 4000, 29, true, 'this-time-different-said-100-times-today'),
('fomo_017', 'Will someone tattoo a meme coin logo today?', 'Permanent FOMO commitment - the ultimate diamond hands.', 'Meta', 'OPEN', NOW() + INTERVAL '24 hours', 1200, 2800, 4000, 18, false, 'tattoo-meme-coin-logo-today'),
('fomo_018', 'Will ''I''m never selling'' age like milk within 6 hours?', 'Paper hands reality check incoming for FOMO declarations.', 'Hype', 'OPEN', NOW() + INTERVAL '6 hours', 2000, 2000, 4000, 24, true, 'never-selling-age-like-milk-6-hours'),
('fomo_019', 'Will someone livestream eating ramen ''until moon'' today?', 'Peak FOMO sacrifice content - trading food for hopium.', 'Viral', 'OPEN', NOW() + INTERVAL '24 hours', 1700, 2300, 4000, 22, false, 'livestream-eating-ramen-until-moon-today'),
('fomo_020', 'Will ''wen moon'' be posted 1000+ times on Reddit in 1 hour?', 'Peak desperation phase of crypto FOMO.', 'Viral', 'OPEN', NOW() + INTERVAL '1 hour', 2300, 1700, 4000, 26, true, 'wen-moon-posted-1000-times-reddit-1-hour');

-- ============================================================================
-- ADD MORE SAMPLE BETS FOR THE NEW MARKETS
-- ============================================================================

INSERT INTO "bets" ("id", "marketId", "userId", "side", "amount", "fee") VALUES
('bet_007', 'market_crypto_sol_001', 'user_001', 'YES', 800, 16),
('bet_008', 'market_meme_shib_001', 'user_002', 'YES', 1200, 24),
('bet_009', 'market_ai_gpt5_001', 'user_003', 'NO', 600, 12),
('bet_010', 'market_fed_rates_001', 'user_001', 'YES', 400, 8),
('bet_011', 'market_gaming_gta6_001', 'user_002', 'YES', 900, 18),
('bet_012', 'market_crypto_ada_001', 'user_003', 'NO', 350, 7);

-- Show summary of what was added
SELECT 'Additional Markets Added!' as status;
SELECT 'Total Markets now:' as table_name, COUNT(*) as count FROM markets
UNION ALL
SELECT 'Total FOMO Markets now:', COUNT(*) FROM fomo_markets
UNION ALL
SELECT 'Total Bets now:', COUNT(*) FROM bets;

-- Show market categories
SELECT category, COUNT(*) as market_count 
FROM markets 
GROUP BY category 
ORDER BY market_count DESC;
