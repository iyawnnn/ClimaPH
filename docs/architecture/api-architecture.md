# API Architecture

ClimaPH uses the **OpenWeatherMap API** to fetch real-time weather data.

## API Key

- Stored in `.env.local` as `NEXT_PUBLIC_OWM_API_KEY`.  
- Example usage in code:

```ts
const apiKey = process.env.NEXT_PUBLIC_OWM_API_KEY;
```

Endpoints

Current Weather by City Name:
https://api.openweathermap.org/data/2.5/weather?q={CITY_NAME}&appid={API_KEY}&units=metric

Optional future endpoints: 5-day forecast, historical weather data.

Notes

- All API calls are done client-side in React components.

- Responses are validated for errors (e.g., city not found).

- Consider caching API results to reduce network requests and improve performance.