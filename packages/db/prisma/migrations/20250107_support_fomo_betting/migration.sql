-- Add marketType column to bets table
ALTER TABLE "bets" ADD COLUMN "marketType" TEXT NOT NULL DEFAULT 'REGULAR';

-- Drop the existing foreign key constraint to make it optional
ALTER TABLE "bets" DROP CONSTRAINT IF EXISTS "bets_marketId_fkey";

-- Add the new optional foreign key constraint
ALTER TABLE "bets" ADD CONSTRAINT "bets_marketId_fkey" 
    FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE;
