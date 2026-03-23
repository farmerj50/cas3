-- AlterTable
ALTER TABLE "Pick" ADD COLUMN "checkedAt" DATETIME;
ALTER TABLE "Pick" ADD COLUMN "drawResult" TEXT;
ALTER TABLE "Pick" ADD COLUMN "isHit" BOOLEAN;

-- CreateTable
CREATE TABLE "Draw" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numbers" TEXT NOT NULL,
    "drawDate" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
