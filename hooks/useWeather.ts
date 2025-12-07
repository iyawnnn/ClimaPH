import { useState } from "react";
import { Suggestion } from "@/types/types";
import { OPENCAGE_KEY, OWM_KEY, WEATHER_TTL } from "@/lib/constants";
import { makeDisplayNameFromComponents, setWithTTL, getWithTTL, isValidSuggestion, capitalize } from "@/lib/utils";

export const useWeather = (selected: Suggestion | null, input: string) => {
  const [weather, setWeather] = useState<any | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [error, setError] = useState("");
  const [fiveDayForecast, setFiveDayForecast] = useState<any | null>(null);
  const [twelveHourForecast, setTwelveHourForecast] = useState<any | null>(null);

  // Fetch current weather
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

    const wkey = `owm_${lat!.toFixed(4)}_${lng!.toFixed(4)}`;
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
    setTwelveHourForecast(null); // Clear 12-hour forecast
    setFiveDayForecast(null); // Reset previous 5-day forecast before fetching

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

      setFiveDayForecast(summarizedForecast);
    } catch (error) {
      setError("Error fetching 5-day forecast.");
    }
  };

  const get12HourForecast = async () => {
    setFiveDayForecast(null); // Clear the 5-day forecast
    setTwelveHourForecast(null); // Reset 12-hour forecast before fetching

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
      setTwelveHourForecast(forecast);
    } catch (error) {
      setError("Error fetching 12-hour forecast.");
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
    setError, // Expose to allow clearing error from outside
  };
};