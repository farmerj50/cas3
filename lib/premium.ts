/**
 * Shared premium-status helpers used on both client and server.
 */

export type PremiumUser = {
  tier: string;
  premiumExpiresAt?: string | Date | null;
};

/** True if user has an active subscription OR an unexpired pass. */
export function isUserPremium(user: PremiumUser): boolean {
  if (user.tier === "premium") return true;
  if (user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date()) return true;
  return false;
}

/**
 * Returns time remaining on a pass, or null if no active pass.
 * (Returns null for full subscribers — they don't have a countdown.)
 */
export function getPassTimeLeft(
  user: PremiumUser
): { label: string; urgent: boolean } | null {
  if (user.tier === "premium") return null; // full sub — no countdown
  if (!user.premiumExpiresAt) return null;

  const expires = new Date(user.premiumExpiresAt);
  const now = new Date();
  if (expires <= now) return null;

  const ms = expires.getTime() - now.getTime();
  const hours = Math.ceil(ms / 3_600_000);
  const days = Math.floor(ms / 86_400_000);

  if (hours <= 3) return { label: `${hours}h left`, urgent: true };
  if (hours < 24) return { label: `${hours}h left`, urgent: false };
  return { label: `${days}d left`, urgent: false };
}
