-- Create database tables for Fomora
-- Run this in Supabase SQL Editor

-- Create enums
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "MarketStatus" AS ENUM ('OPEN', 'CLOSED', 'RESOLVED', 'CANCELLED');
CREATE TYPE "BetSide" AS ENUM ('YES', 'NO');
CREATE TYPE "Resolution" AS ENUM ('YES', 'NO', 'CANCELLED');
CREATE TYPE "ActionType" AS ENUM ('CONNECT', 'CREDITS', 'CREATE_MARKET', 'BET', 'RESOLVE', 'CANCEL', 'LOGIN', 'ADMIN_ACTION');

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

-- Create unique indexes
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");
CREATE UNIQUE INDEX "markets_slug_key" ON "markets"("slug");
CREATE UNIQUE INDEX "fomo_markets_slug_key" ON "fomo_markets"("slug");

-- Add foreign key constraints
ALTER TABLE "markets" ADD CONSTRAINT "markets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bets" ADD CONSTRAINT "bets_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bets" ADD CONSTRAINT "bets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "action_logs" ADD CONSTRAINT "action_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
