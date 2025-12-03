"use client";

import { useEffect, useRef, useState } from "react";
import SearchBar from "@/components/Search/SearchBar";
import Suggestions from "@/components/Search/Suggestions";
import WeatherDisplay from "@/components/Weather/WeatherDisplay";
import Forecast from "@/components/Weather/Forecast";
import { Button } from "@/components/ui/button";

// --- configuration ---
const OPENCAGE_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
const OWM_KEY = process.env.NEXT_PUBLIC_OWM_API_KEY;

// cache TTL (ms)
const SUGGESTIONS_TTL = 24 * 60 * 60 * 1000; // 24 hours
const WEATHER_TTL = 10 * 60 * 1000; // 10 minutes

// allowed place types
const ACCEPTED_PLACE_TYPES = new Set([
  "city",
  "town",
  "village",
  "municipality",
  "county",
  "state",
  "region",
  "hamlet",
]);

type Suggestion = {
  id: string;
  display: string;
  lat: number;
  lng: number;
  components: any;
  place_type: string;
};

export default function Page() {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [weather, setWeather] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [forecastType, setForecastType] = useState<"5-day" | "12-hour">(
    "5-day"
  );
  const [fiveDayForecast, setFiveDayForecast] = useState<any | null>(null);
  const [twelveHourForecast, setTwelveHourForecast] = useState<any | null>(
    null
  );

  const debounceTimer = useRef<number | null>(null);

  // Capitalize function to ensure proper formatting
  const capitalize = (s = "") =>
    s
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ");

  // Make display name from components
  const makeDisplayNameFromComponents = (
    components: any,
    formatted?: string
  ) => {
    if (!components || typeof components !== "object")
      return formatted || "Philippines";
    const city =
      components.city ||
      components.town ||
      components.municipality ||
      components.village ||
      components.county ||
      null;
    const region = components.state || components.region || null;
    if (city && region) return `${city}, ${region}, Philippines`;
    if (city) return `${city}, Philippines`;
    if (region) return `${region}, Philippines`;
    return formatted || "Philippines";
  };

  // Cache and TTL management
  const setWithTTL = (key: string, value: any, ttl: number) => {
    try {
      localStorage.setItem(key, JSON.stringify({ ts: Date.now(), ttl, value }));
    } catch {}
  };

  const getWithTTL = (key: string) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts > parsed.ttl) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.value;
    } catch {
      return null;
    }
  };

  const isValidSuggestion = (s: any) => {
    if (!s) return false;
    if (
      !s.geometry ||
      typeof s.geometry.lat !== "number" ||
      typeof s.geometry.lng !== "number"
    )
      return false;
    if (!s.components || Object.keys(s.components).length === 0) return false;
    return true;
  };

  // Fetch suggestions from OpenCage API
  const fetchSuggestions = async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }

    setError("");
    setLoadingSuggestions(true);

    const cacheKey = `oc_suggestions_${q.toLowerCase()}`;
    const cached = getWithTTL(cacheKey);

    if (cached) {
      setSuggestions(cached);
      setLoadingSuggestions(false);
      return;
    }

    if (!OPENCAGE_KEY) {
      setError("Missing OpenCage API key.");
      setLoadingSuggestions(false);
      return;
    }

    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        q
      )}&key=${OPENCAGE_KEY}&countrycode=PH&limit=10`;

      const res = await fetch(url);
      const data = await res.json();

      if (!Array.isArray(data.results)) {
        setSuggestions([]);
        setLoadingSuggestions(false);
        return;
      }

      const cleanedResults = data.results.filter(isValidSuggestion);

      const mapped: Suggestion[] = cleanedResults
        .map((r: any, idx: number) => {
          const components = r.components || {};
          const place_type = components._type || r._type || "";

          return {
            id:
              r.annotations?.geohash ||
              `${place_type}-${r.geometry.lat}-${r.geometry.lng}-${idx}`,
            display: makeDisplayNameFromComponents(components, r.formatted),
            lat: r.geometry.lat,
            lng: r.geometry.lng,
            components,
            place_type,
          };
        })
        .reduce((acc, cur) => {
          if (!acc.some((a) => a.display === cur.display)) acc.push(cur);
          return acc;
        }, []);

      // Remove duplicates
      const preferred = mapped.filter((m) =>
        ACCEPTED_PLACE_TYPES.has(m.place_type.toLowerCase())
      );

      const final = preferred.length > 0 ? preferred : mapped;
      setSuggestions(final);
      setWithTTL(cacheKey, final, SUGGESTIONS_TTL);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch suggestions.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const debouncedFetch = (q: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      fetchSuggestions(q);
      debounceTimer.current = null;
    }, 450);
  };

  const onChange = (val: string) => {
    setInput(val);
    setSelected(null);
    setWeather(null);
    debouncedFetch(val);
  };

  const pickSuggestion = (s: Suggestion) => {
    if (
      !s ||
      typeof s.lat !== "number" ||
      typeof s.lng !== "number" ||
      !s.components ||
      Object.keys(s.components).length === 0
    ) {
      setError("This location has incomplete data. Please choose another.");
      return;
    }
    setSelected(s);
    setInput(s.display);
    setSuggestions([]); // Clear suggestions after pick
  };

  // Fetch current weather and 5-Day forecast
  const getWeather = async () => {
    setError("");
    setWeather(null);

    let lat: number | undefined;
    let lng: number | undefined;
    let displayName = input;

    if (selected) {
      lat = selected.lat;
      lng = selected.lng;
      displayName = selected.display;
    } else {
      if (!OPENCAGE_KEY) {
        setError("Missing OpenCage API key.");
        return;
      }

      try {
        const q = input.trim();
        if (!q) {
          setError("Please enter a valid location.");
          return;
        }

        setLoadingWeather(true);

        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          q
        )}&key=${OPENCAGE_KEY}&countrycode=PH&limit=1`;

        const res = await fetch(url);
        const data = await res.json();

        const r = data?.results?.[0];

        if (!isValidSuggestion(r)) {
          setError("Location not found or invalid.");
          setLoadingWeather(false);
          return;
        }

        lat = r.geometry.lat;
        lng = r.geometry.lng;
        displayName = makeDisplayNameFromComponents(r.components, r.formatted);
      } catch {
        setError("Failed to geocode location.");
        setLoadingWeather(false);
        return;
      }
    }

    const wkey = `owm_${lat.toFixed(4)}_${lng.toFixed(4)}`;
    const cached = getWithTTL(wkey);

    if (cached) {
      setWeather({ ...cached, displayName });
      return;
    }

    if (!OWM_KEY) {
      setError("Missing OpenWeatherMap API key.");
      return;
    }

    try {
      setLoadingWeather(true);
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OWM_KEY}&units=metric`;

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        setError(json?.message || "Weather fetch error.");
        setLoadingWeather(false);
        return;
      }

      const payload = { ...json, displayName };
      setWeather(payload);
      setWithTTL(wkey, payload, WEATHER_TTL);
    } catch {
      setError("Failed to fetch weather data.");
    } finally {
      setLoadingWeather(false);
    }
  };

  const get5DayForecast = async () => {
    setTwelveHourForecast(undefined); // Clear 12-hour forecast
    setFiveDayForecast(undefined); // Reset previous 5-day forecast before fetching

    if (!OWM_KEY) {
      setError("Missing OpenWeatherMap API key.");
      return;
    }

    let lat: number | undefined;
    let lng: number | undefined;

    if (selected) {
      lat = selected.lat;
      lng = selected.lng;
    } else {
      return;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${OWM_KEY}&units=metric`;

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        setError(json?.message || "Error fetching forecast.");
        return;
      }

      const forecast = json.list;
      const summarizedForecast = forecast.reduce((acc: any, curr: any) => {
        const day = new Date(curr.dt * 1000).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        });

        if (!acc[day]) {
          acc[day] = { high: -Infinity, low: Infinity, description: "" };
        }

        acc[day].high = Math.max(acc[day].high, curr.main.temp_max);
        acc[day].low = Math.min(acc[day].low, curr.main.temp_min);

        if (!acc[day].description) {
          acc[day].description = capitalize(curr.weather[0].description);
        }

        return acc;
      }, {});

      setFiveDayForecast(summarizedForecast); // Make sure the state is updated properly
    } catch (error) {
      setError("Error fetching 5-day forecast.");
    }
  };

  const get12HourForecast = async () => {
    setFiveDayForecast(undefined); // Clear the 5-day forecast
    setTwelveHourForecast(undefined); // Reset 12-hour forecast before fetching

    if (!OWM_KEY) {
      setError("Missing OpenWeatherMap API key.");
      return;
    }

    let lat: number | undefined;
    let lng: number | undefined;

    if (selected) {
      lat = selected.lat;
      lng = selected.lng;
    } else {
      return;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${OWM_KEY}&units=metric`;

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        setError(json?.message || "Error fetching 12-hour forecast.");
        return;
      }

      // Ensure we get data from the first 4 time slots for 12 hours
      const forecast = json.list.slice(0, 4);
      console.log("12-hour forecast data:", forecast); // Log data to verify
      setTwelveHourForecast(forecast); // Correctly update state
    } catch (error) {
      setError("Error fetching 12-hour forecast.");
    }
  };

  return (
    <div className="p-4 max-w-md">
      <h1 className="text-xl font-semibold mb-3">ClimaPH</h1>
      <SearchBar
        input={input}
        onChange={(e) => onChange(e.target.value)}
        getWeather={getWeather}
        loadingWeather={loadingWeather}
      />
      {loadingSuggestions && <p>Searching…</p>}
      {suggestions.length > 0 && (
        <Suggestions
          suggestions={suggestions}
          pickSuggestion={pickSuggestion}
        />
      )}
      <WeatherDisplay weather={weather} error={error} />

      <div className="flex gap-4 mt-6">
        <Button
          onClick={() => {
            setForecastType("5-day");
            get5DayForecast();
          }}
          className="flex-1"
        >
          5-Day Forecast
        </Button>
        <Button
          onClick={() => {
            setForecastType("12-hour");
            get12HourForecast();
          }}
          className="flex-1"
        >
          12-Hour Forecast
        </Button>
      </div>

      {/* Conditional rendering of forecasts */}
      {forecastType === "5-day" ? (
        <Forecast forecast={fiveDayForecast} type="5-day" />
      ) : (
        <Forecast forecast={twelveHourForecast} type="12-hour" />
      )}
    </div>
  );
}
