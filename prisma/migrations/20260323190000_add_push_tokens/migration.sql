-- Add PushToken table for mobile push notification device registration
CREATE TABLE "PushToken" (
  "id"        TEXT     NOT NULL PRIMARY KEY,
  "token"     TEXT     NOT NULL,
  "platform"  TEXT     NOT NULL DEFAULT 'unknown',
  "userId"    TEXT     NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PushToken_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PushToken_token_key" ON "PushToken"("token");
