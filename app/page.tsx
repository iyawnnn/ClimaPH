"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import SearchBar from "@/components/Search/SearchBar";
import Suggestions from "@/components/Search/Suggestions";
import WeatherDisplay from "@/components/Weather/WeatherDisplay";
import Forecast from "@/components/Weather/Forecast";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/hooks/useSearch";
import { useWeather } from "@/hooks/useWeather";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { ModeToggle } from "@/components/ModeToggle";
import MapLegend from "@/components/MapLegend";
import { Suggestion } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getFavorites, addFavorite, removeFavorite } from "@/lib/favorites";

// Dynamic Leaflet imports (no SSR)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

export default function Page() {
  const [forecastType, setForecastType] = useState<"5-day" | "12-hour">(
    "5-day"
  );
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [mapLayer, setMapLayer] = useState<
    "temp_new" | "precipitation_new" | "clouds_new" | "wind_new"
  >("temp_new");

  // Favorites state (persistent)
  const [favorites, setFavorites] = useState<Suggestion[]>(() =>
    getFavorites()
  );

  const toggleFavorite = (loc: Suggestion) => {
    const isFav = favorites.some((f) => f.display === loc.display);
    if (isFav) {
      removeFavorite(loc);
      setFavorites((prev) => prev.filter((f) => f.display !== loc.display));
      toast.success(`${loc.display} removed from favorites`);
    } else {
      addFavorite(loc);
      setFavorites((prev) => [...prev, loc]);
      toast.success(`${loc.display} added to favorites`);
    }
  };

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

  // Show toast once per weather search (forecasts are handled inside getWeather)
  useEffect(() => {
    if (weather) {
      toast.success(`Weather updated for ${weather.displayName}`);
    }
  }, [weather]);

  // Map center
  const mapCenter = weather
    ? [weather.coord.lat, weather.coord.lon]
    : [12.8797, 121.774];
  const mapZoom = weather ? 8 : 5;

  return (
    <div className="p-4 max-w-4xl mx-auto relative">
      {/* Top-right controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
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
        <ModeToggle />

        {/* Favorites modal trigger */}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              Favorites
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm w-full bg-background p-4 rounded-lg z-60">
            <DialogHeader>
              <DialogTitle>Favorites</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2 mt-2 max-h-[300px] overflow-y-auto">
              {favorites.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No favorites yet.
                </p>
              )}
              {favorites.map((fav) => (
                <Button
                  key={fav.display}
                  variant="outline"
                  className="justify-start w-full text-left"
                  onClick={() => {
                    getWeather(fav.lat, fav.lng, fav.display);  // Pass displayName
                  }}
                >
                  {fav.display}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <h1 className="text-2xl font-bold mb-4 text-center">ClimaPH</h1>

      <div className="flex gap-2">
        <SearchBar
          input={input}
          onChange={(e) => onChange(e.target.value)}
          getWeather={getWeather}
          loadingWeather={loadingWeather}
          hasValidSelection={!!selected}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const { latitude, longitude } = pos.coords;
                  getWeather(latitude, longitude);
                },
                () => {
                  toast.error("Unable to get current location.");
                }
              );
            } else {
              setWeatherError("Geolocation is not supported in your browser.");
              toast.error("Geolocation is not supported in your browser.");
            }
          }}
        >
          Current Location
        </Button>
      </div>

      {loadingSuggestions && (
        <div className="mt-2 flex justify-center">
          <Spinner className="w-6 h-6" />
        </div>
      )}

      {suggestions.length > 0 && (
        <Suggestions
          suggestions={suggestions}
          pickSuggestion={pickSuggestion}
        />
      )}

      <WeatherDisplay
        weather={weather}
        error={error}
        loading={loadingWeather}
        unit={unit}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />

      {/* Forecast buttons */}
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
        forecast={
          forecastType === "5-day" ? fiveDayForecast : twelveHourForecast
        }
        type={forecastType}
        unit={unit}
        loading={
          forecastType === "5-day"
            ? loadingWeather && !fiveDayForecast
            : loadingWeather && !twelveHourForecast
        }
      />

      {/* Weather Map */}
      <div className="mt-6 h-[600px] w-full rounded-lg overflow-hidden relative z-10">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
          key={mapLayer}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <TileLayer
            url={`https://tile.openweathermap.org/map/${mapLayer}/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OWM_API_KEY}`}
            attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
          />
        </MapContainer>
        <MapLegend layer={mapLayer} />
      </div>

      {/* Layer selection */}
      <div className="flex justify-center gap-2 mt-2">
        {["temp_new", "precipitation_new", "clouds_new", "wind_new"].map(
          (layer) => (
            <Button
              key={layer}
              size="sm"
              variant={mapLayer === layer ? "default" : "outline"}
              onClick={() => setMapLayer(layer as any)}
            >
              {layer.replace("_new", "").toUpperCase()}
            </Button>
          )
        )}
      </div>
    </div>
  );
}