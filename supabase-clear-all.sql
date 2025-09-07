-- CLEAR ALL DATA FROM FOMORA DATABASE
-- Use this to reset everything and start fresh
-- WARNING: This will delete ALL data!

-- Clear all data from tables (in correct order due to foreign keys)
DELETE FROM "bets";
DELETE FROM "action_logs";
DELETE FROM "markets";
DELETE FROM "fomo_markets";
DELETE FROM "users";
DELETE FROM "config";

-- Reset any sequences if needed
-- (PostgreSQL will handle this automatically for our setup)

-- Verify everything is cleared
SELECT 'Database cleared! Verification:' as status;
SELECT 'Users remaining:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Markets remaining:', COUNT(*) FROM markets
UNION ALL
SELECT 'FOMO Markets remaining:', COUNT(*) FROM fomo_markets
UNION ALL
SELECT 'Bets remaining:', COUNT(*) FROM bets
UNION ALL
SELECT 'Action logs remaining:', COUNT(*) FROM action_logs
UNION ALL
SELECT 'Config entries remaining:', COUNT(*) FROM config;

-- All counts should be 0 after running this script
