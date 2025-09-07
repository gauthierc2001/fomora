-- ============================================================================
-- CLEAN FOMORA DATABASE - REAL USERS ONLY
-- This script removes mock users and keeps only system users and real connected users
-- ============================================================================

-- Remove all mock/sample users (keep only system users)
DELETE FROM "bets" WHERE "userId" IN (
  SELECT id FROM "users" WHERE "walletAddress" LIKE '0x%' AND "walletAddress" != '0x0000000000000000000000000000000000000000' AND "walletAddress" != '0x0000000000000000000000000000000000000001'
);

DELETE FROM "action_logs" WHERE "userId" IN (
  SELECT id FROM "users" WHERE "walletAddress" LIKE '0x%' AND "walletAddress" != '0x0000000000000000000000000000000000000000' AND "walletAddress" != '0x0000000000000000000000000000000000000001'
);

DELETE FROM "users" WHERE "walletAddress" LIKE '0x%' AND "walletAddress" != '0x0000000000000000000000000000000000000000' AND "walletAddress" != '0x0000000000000000000000000000000000000001';

-- Update user statistics to reflect the cleanup
UPDATE users SET 
    "totalBets" = (SELECT COUNT(*) FROM bets WHERE "userId" = users.id),
    "totalWagered" = (SELECT COALESCE(SUM(amount), 0) FROM bets WHERE "userId" = users.id),
    "marketsCreated" = (SELECT COUNT(*) FROM markets WHERE "createdBy" = users.id);

-- Show remaining users
SELECT 'Cleanup Complete! Remaining users:' as status;
SELECT 
    "displayName",
    "walletAddress",
    "pointsBalance",
    "totalBets",
    "totalWagered",
    "marketsCreated",
    role
FROM users 
ORDER BY "createdAt";

SELECT 'Active Markets:' as markets_status;
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

SELECT 'FOMO Markets:' as fomo_status;
SELECT 
    question,
    category,
    "yesPool",
    "noPool"
FROM fomo_markets 
WHERE status = 'OPEN'
ORDER BY "createdAt" DESC
LIMIT 5;
