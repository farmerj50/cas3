export const STATES = [
  { code: "GA", name: "Georgia",        game: "Cash 3"  },
  { code: "FL", name: "Florida",        game: "Pick 3"  },
  { code: "TX", name: "Texas",          game: "Daily 3" },
  { code: "TN", name: "Tennessee",      game: "Cash 3"  },
  { code: "AL", name: "Alabama",        game: "Cash 3"  },
  { code: "NC", name: "North Carolina", game: "Pick 3"  },
  { code: "SC", name: "South Carolina", game: "Pick 3"  },
  { code: "VA", name: "Virginia",       game: "Pick 3"  },
  { code: "MD", name: "Maryland",       game: "Pick 3"  },
  { code: "OH", name: "Ohio",           game: "Pick 3"  },
  { code: "PA", name: "Pennsylvania",   game: "Pick 3"  },
  { code: "NJ", name: "New Jersey",     game: "Pick 3"  },
  { code: "NY", name: "New York",       game: "Numbers" },
  { code: "MI", name: "Michigan",       game: "Daily 3" },
  { code: "IL", name: "Illinois",       game: "Pick 3"  },
  { code: "IN", name: "Indiana",        game: "Daily 3" },
  { code: "MO", name: "Missouri",       game: "Pick 3"  },
  { code: "KY", name: "Kentucky",       game: "Pick 3"  },
  { code: "MS", name: "Mississippi",    game: "Cash 3"  },
  { code: "LA", name: "Louisiana",      game: "Pick 3"  },
] as const;

export type StateCode = (typeof STATES)[number]["code"];

export function getStateMeta(code: string) {
  return STATES.find((s) => s.code === code) ?? STATES[0];
}
