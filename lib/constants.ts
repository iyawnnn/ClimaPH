export const OWM_KEY = process.env.NEXT_PUBLIC_OWM_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
export const OPENCAGE_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
export const WEATHER_TTL = 300000;

// Cache TTL (ms)
export const SUGGESTIONS_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Allowed place types
export const ACCEPTED_PLACE_TYPES = new Set([
  "city",
  "town",
  "village",
  "municipality",
  "county",
  "state",
  "region",
  "hamlet",
]);
