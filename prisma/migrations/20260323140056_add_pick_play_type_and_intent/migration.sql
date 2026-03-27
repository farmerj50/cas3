-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numbers" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "algorithm" TEXT NOT NULL,
    "playType" TEXT NOT NULL DEFAULT 'box',
    "intendedDate" TEXT,
    "intendedPeriod" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "isHit" BOOLEAN,
    "drawResult" TEXT,
    "checkedAt" DATETIME,
    CONSTRAINT "Pick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Pick" ("algorithm", "checkedAt", "createdAt", "drawResult", "id", "isHit", "numbers", "score", "userId") SELECT "algorithm", "checkedAt", "createdAt", "drawResult", "id", "isHit", "numbers", "score", "userId" FROM "Pick";
DROP TABLE "Pick";
ALTER TABLE "new_Pick" RENAME TO "Pick";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
