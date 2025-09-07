-- Clear existing markets to allow repopulation with crypto markets
-- Run this in Supabase SQL Editor

-- Clear all markets and related data
DELETE FROM bets;
DELETE FROM markets;
DELETE FROM fomo_markets;

-- Reset sequences if needed
-- This will allow fresh population with crypto markets with live prices
