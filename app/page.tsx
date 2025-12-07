"use client";

import { useState } from "react";
import SearchBar from "@/components/Search/SearchBar";
import Suggestions from "@/components/Search/Suggestions";
import WeatherDisplay from "@/components/Weather/WeatherDisplay";
import Forecast from "@/components/Weather/Forecast";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/hooks/useSearch";
import { useWeather } from "@/hooks/useWeather";

export default function Page() {
  const [forecastType, setForecastType] = useState<"5-day" | "12-hour">("5-day");

  const {
    input,
    suggestions,
    selected,
    loadingSuggestions,
    error: searchError,
    onChange,
    pickSuggestion,
    setError: setSearchError,
  } = useSearch();

  const {
    weather,
    loadingWeather,
    error: weatherError,
    fiveDayForecast,
    twelveHourForecast,
    getWeather,
    get5DayForecast,
    get12HourForecast,
    setError: setWeatherError,
  } = useWeather(selected, input);

  const error = searchError || weatherError;
  const setError = (msg: string) => {
    setSearchError(msg);
    setWeatherError(msg);
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
