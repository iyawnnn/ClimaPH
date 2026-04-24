import { useState, useEffect } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { makeDisplayNameFromComponents, isValidSuggestion } from "@/lib/utils";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "API request failed");
  }
  return res.json();
};

export const useWeather = () => {
  const target = useAppStore((state) => state.targetLocation);
  const setTarget = useAppStore((state) => state.setTargetLocation);
  const unit = useAppStore((state) => state.unit);
  
  const [error, setError] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);

  const safeLon = target ? ((target as any).lon ?? (target as any).lng ?? (target as any).longitude) : undefined;
  const systemUnit = unit === "C" ? "metric" : "imperial";

  const hasValidCoordinates = target && safeLon !== undefined;

  const weatherUrl = hasValidCoordinates
    ? `/api/weather?lat=${target.lat}&lon=${safeLon}&units=${systemUnit}&type=weather`
    : null;

  const forecastUrl = hasValidCoordinates
    ? `/api/weather?lat=${target.lat}&lon=${safeLon}&units=${systemUnit}&type=forecast`
    : null;

  const { data: rawWeather, error: weatherError, isLoading: loadingWeatherSWR } = useSWR(weatherUrl, fetcher, {
    dedupingInterval: 300000, 
    revalidateOnFocus: false,
    onSuccess: () => {
      if (target) toast.success(`Weather updated for ${target.display}`);
    }
  });

  const { data: rawForecast, error: forecastError, isLoading: loadingForecastSWR } = useSWR(forecastUrl, fetcher, {
    dedupingInterval: 300000,
    revalidateOnFocus: false,
  });

  const weather = rawWeather && target ? { ...rawWeather, displayName: target.display } : null;
  let fiveDayForecast = null;
  let twelveHourForecast = null;

  if (rawForecast && weather) {
    fiveDayForecast = rawForecast.list;

    const currentPoint = {
      dt: Math.floor(Date.now() / 1000),
      main: weather.main,
      weather: weather.weather,
      isCurrent: true,
    };
    twelveHourForecast = [currentPoint, ...rawForecast.list].slice(0, 9);
  }

  const getWeather = async (latInput?: number, lonInput?: number, displayNameInput?: string) => {
    setError("");
    if (latInput && lonInput) {
      let display = displayNameInput || "Unknown Location";
      
      if (!displayNameInput) {
        setIsGeocoding(true);
        try {
          const url = `/api/geocode?q=${latInput},${lonInput}&limit=1`;
          const res = await fetch(url);
          const data = await res.json();
          const r = data?.results?.[0];
          if (isValidSuggestion(r)) {
            display = makeDisplayNameFromComponents(r?.components, r?.formatted) || "Unknown Location";
          }
        } catch (e) {
          console.error("Geocoding failed", e);
        }
        setIsGeocoding(false);
      }
      
      setTarget({ lat: latInput, lng: lonInput, display });
    }
  };

  useEffect(() => {
    if (weatherError || forecastError) {
      setError("Failed to fetch weather data.");
    }
  }, [weatherError, forecastError]);

  return {
    weather,
    loadingWeather: loadingWeatherSWR || loadingForecastSWR || isGeocoding,
    error,
    fiveDayForecast,
    twelveHourForecast,
    getWeather, 
    setError,
  };
};