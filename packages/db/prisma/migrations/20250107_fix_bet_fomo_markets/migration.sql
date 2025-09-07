-- AlterTable
ALTER TABLE "bets" ADD COLUMN "marketType" TEXT NOT NULL DEFAULT 'REGULAR';

-- Drop the existing foreign key constraint
ALTER TABLE "bets" DROP CONSTRAINT "bets_marketId_fkey";

-- Make the foreign key constraint optional (allow NULL)
-- We can't make marketId nullable without more complex migration, so we'll remove the constraint entirely
-- and handle validation in the application code
