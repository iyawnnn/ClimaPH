// constants.ts

export const CONFIG = {
  OPENWEATHER_API_KEY: process.env.NEXT_PUBLIC_OWM_API_KEY,
  OPENCAGE_API_KEY: process.env.NEXT_PUBLIC_OPENCAGE_API_KEY,
  WEATHER_TTL: 10 * 60 * 1000,  // Cache weather data for 10 minutes
  GEOCODE_TTL: 24 * 60 * 60 * 1000,  // Cache geocode data for 24 hours
  WEATHER_FORECAST_TTL: 5 * 24 * 60 * 60 * 1000,  // 5-day weather forecast TTL
};
