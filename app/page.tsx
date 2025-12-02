"use client";

import { useEffect, useRef, useState } from "react";
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

  const debounceTimer = useRef<number | null>(null);

  const capitalize = (s = "") =>
    s
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ");

  // FIX: safe display name generator
  const makeDisplayNameFromComponents = (components: any, formatted?: string) => {
    if (!components || typeof components !== "object") return formatted || "Philippines";

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

  const setWithTTL = (key: string, value: any, ttl: number) => {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ ts: Date.now(), ttl, value })
      );
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

  // FIX: suggestion validator
  const isValidSuggestion = (s: any) => {
    if (!s) return false;
    if (!s.geometry || typeof s.geometry.lat !== "number" || typeof s.geometry.lng !== "number")
      return false;
    if (!s.components || Object.keys(s.components).length === 0) return false;
    return true;
  };

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

      // FIX: filter out empty component results BEFORE mapping
      const cleanedResults = data.results.filter(isValidSuggestion);

      const mapped: Suggestion[] = cleanedResults
        .map((r: any, idx: number) => {
          const components = r.components || {};
          const place_type = components._type || r._type || "";
          return {
            id: r.annotations?.geohash || `${place_type}-${r.geometry.lat}-${r.geometry.lng}-${idx}`,
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

  // FIX: prevent selecting invalid suggestions
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
    setSuggestions([]);
  };

  // FIX: protect getWeather() from empty components
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!el.closest("input")) setSuggestions([]);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="p-4 max-w-md">
      <h1 className="text-xl font-semibold mb-3">ClimaPH</h1>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter city or province"
          className="p-2 border rounded flex-1"
        />
        <Button onClick={getWeather}>
          {loadingWeather ? "Loading..." : "Get Weather"}
        </Button>
      </div>

      {loadingSuggestions && <p>Searching…</p>}

      {suggestions.length > 0 && (
        <ul className="border rounded mt-2 max-h-56 overflow-auto">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="p-2 hover:bg-slate-100 cursor-pointer"
              onClick={() => pickSuggestion(s)}
            >
              {s.display}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-red-600 mt-3">{error}</p>}

      {weather && (
        <div className="mt-4 border rounded p-3">
          <h3 className="font-bold">{weather.displayName}</h3>
          <p className="capitalize">
            {capitalize(weather.weather?.[0]?.description || "")}
          </p>
          <p className="text-lg">{Math.round(weather.main?.temp)}°C</p>
          <p className="text-sm text-muted-foreground">
            Humidity: {weather.main?.humidity}% • Wind: {weather.wind?.speed} m/s
          </p>
        </div>
      )}
    </div>
  );
}
