export const MAX_GENERATIONS_PER_DAY = 20;

export const TOKEN_LIMITS = {
  longForm: 4096,
  social: 1024,
} as const;

export const MODEL_MAP = {
  longForm: "claude-opus-4-5-20250514",
  social: "claude-haiku-4-5-20241022",
} as const;
