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
  const [twelveHourForecast, setTwelveHourForecast] = useState<any | null>(null);
  const [favorites, setFavorites] = useState<Suggestion[]>(getFavorites());

  // Function to get weather data
  const getWeather = async (latInput?: number, lonInput?: number, displayNameInput?: string) => {
    setError("");
    setWeather(null);
    setFiveDayForecast(null);
    setTwelveHourForecast(null);
    setLoadingWeather(true);

    let lat: number | undefined = latInput;
    let lng: number | undefined = lonInput;
    let displayName = displayNameInput || input;

    try {
      if (!lat || !lng) {
        if (selected) {
          lat = selected.lat;
          lng = selected.lng;
          displayName = selected.display;
        } else {
          if (!OPENCAGE_KEY) {
             setError("Missing OpenCage API key.");
             setLoadingWeather(false);
             return;
          }
          setLoadingWeather(false);
          return;
        }
      } else {
        if (!displayNameInput && OPENCAGE_KEY) {
          const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=${OPENCAGE_KEY}&countrycode=PH&limit=1`;
          const res = await fetch(url);
          const data = await res.json();
          const r = data?.results?.[0];

          if (isValidSuggestion(r)) {
            displayName = makeDisplayNameFromComponents(r?.components, r?.formatted);
          }
          if (!displayName) displayName = "Unknown Location";
        }
      }

      await fetchWeather(lat!, lng!, displayName);
      
    } catch (e) {
      setError("An unexpected error occurred.");
      setLoadingWeather(false);
    }
  };

  const fetchWeather = async (lat: number, lng: number, displayName: string) => {
    const wkey = `owm_${lat.toFixed(4)}_${lng.toFixed(4)}`;
    const cached = getWithTTL(wkey);

    if (cached) {
      setWeather({ ...cached, displayName });
      setLoadingWeather(false); 
      toast.success(`Weather updated for ${displayName}`);
      return;
    }

    if (!OWM_KEY) {
      setError("Missing OpenWeatherMap API key.");
      setLoadingWeather(false);
      return;
    }

    try {
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

      toast.success(`Weather updated for ${displayName}`);
    } catch {
      setError("Failed to fetch weather data.");
    } finally {
      setLoadingWeather(false);
    }
  };

  const get5DayForecast = async () => {
    if (!OWM_KEY || !weather) return;

    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${weather.coord.lat}&lon=${weather.coord.lon}&appid=${OWM_KEY}&units=metric`;
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) return;

      // FIX: Just save the raw list. 
      // The ProForecast component will handle the daily summary logic.
      setFiveDayForecast(json.list);
      
    } catch {
      setError("Error fetching 5-day forecast.");
    }
  };

  const get12HourForecast = async () => {
    if (!OWM_KEY || !weather) return;

    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${weather.coord.lat}&lon=${weather.coord.lon}&appid=${OWM_KEY}&units=metric`;
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) return;

      // --- THE FIX START ---
      // 1. Get standard forecast list
      let forecastList = json.list;

      // 2. Create a "fake" forecast item representing NOW using the current weather data.
      // This ensures the chart starts exactly at the current hour.
      const currentPoint = {
        dt: Math.floor(Date.now() / 1000), // Current timestamp
        main: weather.main,
        weather: weather.weather,
        // Add a flag so we know this is the start point
        isCurrent: true 
      };

      // 3. Prepend this "Now" point to the list
      const fullList = [currentPoint, ...forecastList];

      // 4. Take the first 9 items (Current + next 24 hours approx)
      const rawData = fullList.slice(0, 9);
      
      setTwelveHourForecast(rawData);
      // --- THE FIX END ---
      
    } catch {
      setError("Error fetching 12-hour forecast.");
    }
  };

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