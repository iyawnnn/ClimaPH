import { NextResponse } from "next/server";

// In-memory cache for geocode and weather results
// Keys are the query string or coordinates; values contain the data and timestamp
const cache: Record<string, { ts: number; value: any }> = {};

// Cache TTLs (in milliseconds)
const GEOCODE_TTL = 24 * 60 * 60 * 1000; // 24 hours for geocoding
const WEATHER_TTL = 10 * 60 * 1000; // 10 minutes for weather

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const ocKey = process.env.OPENCAGE_API_KEY; // server-side only
  const owKey = process.env.OPENWEATHER_API_KEY; // server-side only

  if (!ocKey || !owKey) {
    return NextResponse.json(
      { error: "Missing API keys. Check your .env file." },
      { status: 500 }
    );
  }

  try {
    // ----- 1️⃣ Check Geocode Cache -----
    const geoCacheKey = `geocode_${query.toLowerCase()}`;
    const cachedGeo = cache[geoCacheKey];
    let normalizedLocations: any[];

    if (cachedGeo && Date.now() - cachedGeo.ts < GEOCODE_TTL) {
      normalizedLocations = cachedGeo.value;
    } else {
      // ----- 2️⃣ Fetch Geocode from OpenCage -----
      const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        query
      )}&key=${ocKey}&limit=5&language=en`;

      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        return NextResponse.json({ results: [], weather: null }, { status: 200 });
      }

      // ----- 3️⃣ Normalize Geocode Results -----
      normalizedLocations = geoData.results.map((r: any) => {
        const c = r.components;
        const parts = [
          c.city || c.town || c.village || c.hamlet || null,
          c.state || c.region || null,
          c.country || null,
        ].filter(Boolean);

        return {
          formatted: parts.join(", "),
          city: c.city || c.town || c.village || c.hamlet || null,
          state: c.state || c.region || null,
          country: c.country || null,
          lat: r.geometry.lat,
          lng: r.geometry.lng,
        };
      });

      // ----- 4️⃣ Store Geocode in Cache -----
      cache[geoCacheKey] = { ts: Date.now(), value: normalizedLocations };
    }

    // ----- 5️⃣ Check Weather Cache for First Location -----
    const first = normalizedLocations[0];
    const weatherCacheKey = `weather_${first.lat.toFixed(4)}_${first.lng.toFixed(4)}`;
    let weatherData: any;

    if (cache[weatherCacheKey] && Date.now() - cache[weatherCacheKey].ts < WEATHER_TTL) {
      weatherData = cache[weatherCacheKey].value;
    } else {
      // ----- 6️⃣ Fetch Weather from OpenWeatherMap -----
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${first.lat}&lon=${first.lng}&appid=${owKey}&units=metric`;
      const weatherRes = await fetch(weatherUrl);
      weatherData = await weatherRes.json();

      if (!weatherRes.ok) {
        return NextResponse.json(
          { results: normalizedLocations, weather: null, error: weatherData.message || "Unable to fetch weather." },
          { status: 200 }
        );
      }

      // ----- 7️⃣ Store Weather in Cache -----
      cache[weatherCacheKey] = { ts: Date.now(), value: weatherData };
    }

    // ----- 8️⃣ Return Normalized Geocode + Weather -----
    return NextResponse.json({ results: normalizedLocations, weather: weatherData }, { status: 200 });
  } catch (error) {
    console.error("route.ts error:", error);
    return NextResponse.json(
      { error: "Server error fetching geocode/weather" },
      { status: 500 }
    );
  }
}
