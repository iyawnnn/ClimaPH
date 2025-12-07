"use client";

import { useState } from "react";
import SearchBar from "@/components/Search/SearchBar";
import Suggestions from "@/components/Search/Suggestions";
import WeatherDisplay from "@/components/Weather/WeatherDisplay";
import Forecast from "@/components/Weather/Forecast";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/hooks/useSearch";
import { useWeather } from "@/hooks/useWeather";
import { toast } from "sonner";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { ModeToggle } from "@/components/ModeToggle";

export default function Page() {
  const [forecastType, setForecastType] = useState<"5-day" | "12-hour">("5-day");
  const [unit, setUnit] = useState<"C" | "F">("C"); // <-- unit state

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
    toast.error(msg);
  };

  return (
    <div className="p-4 max-w-md mx-auto relative">
      {/* Top-right controls: Dark mode + Unit switcher */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {/* Unit switcher */}
        <Button
          variant={unit === "C" ? "default" : "outline"}
          size="sm"
          onClick={() => setUnit("C")}
        >
          °C
        </Button>
        <Button
          variant={unit === "F" ? "default" : "outline"}
          size="sm"
          onClick={() => setUnit("F")}
        >
          °F
        </Button>

        {/* Dark mode toggle */}
        <ModeToggle />
      </div>

      <h1 className="text-2xl font-bold mb-4 text-center">ClimaPH</h1>

      <SearchBar
        input={input}
        onChange={(e) => onChange(e.target.value)}
        getWeather={getWeather}
        loadingWeather={loadingWeather}
        hasValidSelection={!!selected}
      />

      {loadingSuggestions && (
        <div className="mt-2 flex justify-center">
          <Spinner className="w-6 h-6" />
        </div>
      )}

      {suggestions.length > 0 && (
        <Suggestions suggestions={suggestions} pickSuggestion={pickSuggestion} />
      )}

      <WeatherDisplay weather={weather} error={error} loading={loadingWeather} unit={unit} />

      <div className="flex gap-4 mt-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={forecastType === "5-day" ? "default" : "outline"}
              onClick={() => {
                setForecastType("5-day");
                get5DayForecast();
              }}
              className="flex-1"
            >
              5-Day Forecast
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View the 5-day weather forecast</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={forecastType === "12-hour" ? "default" : "outline"}
              onClick={() => {
                setForecastType("12-hour");
                get12HourForecast();
              }}
              className="flex-1"
            >
              12-Hour Forecast
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View the 12-hour weather forecast</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Forecast
        forecast={forecastType === "5-day" ? fiveDayForecast : twelveHourForecast}
        type={forecastType}
        unit={unit} // <-- pass unit prop
        loading={
          forecastType === "5-day"
            ? loadingWeather && !fiveDayForecast
            : loadingWeather && !twelveHourForecast
        }
      />
    </div>
  );
}
