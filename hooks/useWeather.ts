import { useState, useEffect } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Suggestion } from "@/types/types";
import { OPENCAGE_KEY, OWM_KEY } from "@/lib/constants";
import { makeDisplayNameFromComponents, isValidSuggestion } from "@/lib/utils";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "API request failed");
  }
  return res.json();
};

export const useWeather = (selected: Suggestion | null, input: string) => {
  const [target, setTarget] = useState<{
    lat: number;
    lng: number;
    displayName: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);

  const weatherUrl =
    target && OWM_KEY
      ? `https://api.openweathermap.org/data/2.5/weather?lat=${target.lat}&lon=${target.lng}&appid=${OWM_KEY}&units=metric`
      : null;

  const forecastUrl =
    target && OWM_KEY
      ? `https://api.openweathermap.org/data/2.5/forecast?lat=${target.lat}&lon=${target.lng}&appid=${OWM_KEY}&units=metric`
      : null;

  const {
    data: rawWeather,
    error: weatherError,
    isLoading: loadingWeatherSWR,
  } = useSWR(weatherUrl, fetcher, {
    dedupingInterval: 300000,
    revalidateOnFocus: false,
    onSuccess: () => {
      if (target) toast.success(`Weather updated for ${target.displayName}`);
    },
  });

  const {
    data: rawForecast,
    error: forecastError,
    isLoading: loadingForecastSWR,
  } = useSWR(forecastUrl, fetcher, {
    dedupingInterval: 300000,
    revalidateOnFocus: false,
  });

  const weather =
    rawWeather && target
      ? { ...rawWeather, displayName: target.displayName }
      : null;
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

  const getWeather = async (
    latInput?: number,
    lonInput?: number,
    displayNameInput?: string,
  ) => {
    setError("");
    let lat = latInput;
    let lng = lonInput;
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
          }
          return;
        }
      } else {
        if (!displayNameInput && OPENCAGE_KEY) {
          setIsGeocoding(true);
          const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=${OPENCAGE_KEY}&countrycode=PH&limit=1`;
          const res = await fetch(url);
          const data = await res.json();
          const r = data?.results?.[0];

          if (isValidSuggestion(r)) {
            displayName =
              makeDisplayNameFromComponents(r?.components, r?.formatted) ||
              "Unknown Location";
          }
          if (!displayName) displayName = "Unknown Location";
          setIsGeocoding(false);
        }
      }

      if (lat && lng) {
        setTarget({ lat, lng, displayName: displayName || "Unknown Location" });
      }
    } catch (e) {
      setError("An unexpected error occurred.");
      setIsGeocoding(false);
    }
  };

  const get5DayForecast = async () => {};
  const get12HourForecast = async () => {};

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
    get5DayForecast,
    get12HourForecast,
    setError,
  };
};
