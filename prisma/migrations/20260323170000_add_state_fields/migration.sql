-- Add state to User
ALTER TABLE "User" ADD COLUMN "state" TEXT NOT NULL DEFAULT 'GA';

-- Add state to Draw
ALTER TABLE "Draw" ADD COLUMN "state" TEXT NOT NULL DEFAULT 'GA';
