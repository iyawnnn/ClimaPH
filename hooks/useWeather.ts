import { useState } from "react";
import { toast } from "sonner";
import { Suggestion } from "@/types/types";
import { OPENCAGE_KEY, OWM_KEY, WEATHER_TTL } from "@/lib/constants";
import {
  makeDisplayNameFromComponents,
  setWithTTL,
  getWithTTL,
  isValidSuggestion,
  capitalize,
} from "@/lib/utils";
import { getFavorites, addFavorite, removeFavorite } from "@/lib/favorites";

export const useWeather = (selected: Suggestion | null, input: string) => {
  const [weather, setWeather] = useState<any | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [error, setError] = useState("");
  const [fiveDayForecast, setFiveDayForecast] = useState<any | null>(null);
  const [twelveHourForecast, setTwelveHourForecast] = useState<any | null>(
    null
  );
  const [favorites, setFavorites] = useState<Suggestion[]>(getFavorites());

  // Function to get weather data
  const getWeather = async (latInput?: number, lonInput?: number, displayNameInput?: string) => {
    setError("");
    setWeather(null);
    // Clear forecasts when location changes
    setFiveDayForecast(null);
    setTwelveHourForecast(null);

    let lat: number | undefined = latInput;
    let lng: number | undefined = lonInput;
    let displayName = displayNameInput || input;

    if (!lat || !lng) {
      if (selected) {
        lat = selected.lat;
        lng = selected.lng;
        displayName = selected.display;
      } else {
        setError("No valid location selected.");
        if (!OPENCAGE_KEY) {
          setError("Missing OpenCage API key.");
          toast.error("Missing OpenCage API key.");
          return;
        }

        // Try to get the current location using the browser's geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              lat = position.coords.latitude;
              lng = position.coords.longitude;

              // Fetch displayName from OpenCage
              const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=${OPENCAGE_KEY}&countrycode=PH&limit=1`;
              const res = await fetch(url);
              const data = await res.json();
              const r = data?.results?.[0];

              if (isValidSuggestion(r)) {
                displayName = makeDisplayNameFromComponents(r?.components, r?.formatted);
              }

              if (!displayName) {
                displayName = "Your Location"; // Fallback name
              }

              // Now fetch weather with resolved displayName
              await fetchWeather(lat, lng, displayName);
            },
            () => {
              setError("Failed to get current location.");
              toast.error("Failed to get current location.");
            }
          );
        } else {
          setError("Geolocation is not supported by this browser.");
          toast.error("Geolocation is not supported by this browser.");
        }
        return;
      }
    } else {
      // If lat/lng provided but no displayName, fetch it from OpenCage
      if (!displayNameInput) {
        if (!OPENCAGE_KEY) {
          setError("Missing OpenCage API key.");
          toast.error("Missing OpenCage API key.");
          return;
        }

        const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=${OPENCAGE_KEY}&countrycode=PH&limit=1`;
        const res = await fetch(url);
        const data = await res.json();
        const r = data?.results?.[0];

        if (isValidSuggestion(r)) {
          displayName = makeDisplayNameFromComponents(r?.components, r?.formatted);
        }

        if (!displayName) {
          displayName = "Unknown Location"; // Fallback
        }
      }
    }

    // Fetch weather with resolved displayName
    await fetchWeather(lat!, lng!, displayName);
  };

  // Helper function to fetch weather data
  const fetchWeather = async (lat: number, lng: number, displayName: string) => {
    // Use cached data if available
    const wkey = `owm_${lat.toFixed(4)}_${lng.toFixed(4)}`;
    const cached = getWithTTL(wkey);

    if (cached) {
      setWeather({ ...cached, displayName });
      toast.success(`Weather updated for ${displayName}`);
      return;
    }

    if (!OWM_KEY) {
      setError("Missing OpenWeatherMap API key.");
      toast.error("Missing OpenWeatherMap API key.");
      return;
    }

    try {
      setLoadingWeather(true);
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OWM_KEY}&units=metric`;
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        setError(json?.message || "Weather fetch error.");
        toast.error(json?.message || "Weather fetch error.");
        setLoadingWeather(false);
        return;
      }

      const payload = { ...json, displayName };
      setWeather(payload);
      setWithTTL(wkey, payload, WEATHER_TTL);

      toast.success(`Weather updated for ${displayName}`);
    } catch {
      setError("Failed to fetch weather data.");
      toast.error("Failed to fetch weather data.");
    } finally {
      setLoadingWeather(false);
    }
  };

  // Fetch 5-day forecast
  const get5DayForecast = async () => {
    setTwelveHourForecast(null);
    setFiveDayForecast(null);

    if (!OWM_KEY) {
      setError("Missing OpenWeatherMap API key.");
      toast.error("Missing OpenWeatherMap API key.");
      return;
    }

    // Use selected if available, otherwise fall back to weather.coord
    let lat: number, lng: number;
    if (selected) {
      lat = selected.lat;
      lng = selected.lng;
    } else if (weather) {
      lat = weather.coord.lat;
      lng = weather.coord.lon;
    } else {
      return; // No location available
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${OWM_KEY}&units=metric`;
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        setError(json?.message || "Error fetching forecast.");
        toast.error(json?.message || "Error fetching forecast.");
        return;
      }

      const forecast = json.list;
      const summarizedForecast = forecast.reduce((acc: any, curr: any) => {
        const day = new Date(curr.dt * 1000).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        });

        if (!acc[day])
          acc[day] = { high: -Infinity, low: Infinity, description: "" };
        acc[day].high = Math.max(acc[day].high, curr.main.temp_max);
        acc[day].low = Math.min(acc[day].low, curr.main.temp_min);
        if (!acc[day].description)
          acc[day].description = capitalize(curr.weather[0].description);

        return acc;
      }, {});

      const first5Days: any = {};
      Object.keys(summarizedForecast)
        .slice(0, 5)
        .forEach((key) => {
          first5Days[key] = summarizedForecast[key];
        });

      setFiveDayForecast(first5Days);
      toast.success(`5-day forecast ready for ${weather?.displayName || "selected location"}`);
    } catch {
      setError("Error fetching 5-day forecast.");
      toast.error("Error fetching 5-day forecast.");
    }
  };

  // Fetch 12-hour forecast
  const get12HourForecast = async () => {
    setFiveDayForecast(null);
    setTwelveHourForecast(null);

    if (!OWM_KEY) {
      setError("Missing OpenWeatherMap API key.");
      toast.error("Missing OpenWeatherMap API key.");
      return;
    }

    // Use selected if available, otherwise fall back to weather.coord
    let lat: number, lng: number;
    if (selected) {
      lat = selected.lat;
      lng = selected.lng;
    } else if (weather) {
      lat = weather.coord.lat;
      lng = weather.coord.lon;
    } else {
      return; // No location available
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${OWM_KEY}&units=metric`;
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        setError(json?.message || "Error fetching 12-hour forecast.");
        toast.error(json?.message || "Error fetching 12-hour forecast.");
        return;
      }

      const PH_OFFSET = 8 * 60 * 60 * 1000; // UTC+8
      const now = Date.now();

      const localForecast = json.list.map((f: any) => ({
        ...f,
        localDt: f.dt * 1000 + PH_OFFSET,
      }));

      const startIndex = localForecast.findIndex((f) => f.localDt >= now);
      if (startIndex === -1) {
        setError("No forecast data available.");
        return;
      }

      const next12Hours = localForecast.slice(startIndex, startIndex + 4);
      setTwelveHourForecast(next12Hours);

      toast.success(`12-hour forecast ready for ${weather?.displayName || "selected location"}`);
    } catch {
      setError("Error fetching 12-hour forecast.");
      toast.error("Error fetching 12-hour forecast.");
    }
  };

  // Toggle location in favorites
  const toggleFavorite = (loc: Suggestion) => {
    const isFav = favorites.some((f) => f.display === loc.display);
    if (isFav) {
      removeFavorite(loc);
      setFavorites((prev) => prev.filter((f) => f.display !== loc.display));
    } else {
      addFavorite(loc);
      setFavorites((prev) => [...prev, loc]);
    }
  };

  return {
    weather,
    loadingWeather,
    error,
    fiveDayForecast,
    twelveHourForecast,
    getWeather,
    get5DayForecast,
    get12HourForecast,
    setError,
  };
};