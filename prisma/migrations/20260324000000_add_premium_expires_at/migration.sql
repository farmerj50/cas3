-- Add premiumExpiresAt for time-limited day/week pass holders
ALTER TABLE "User" ADD COLUMN "premiumExpiresAt" DATETIME;
