"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import SearchBar from "@/components/Search/SearchBar";
import Suggestions from "@/components/Search/Suggestions";
import CurrentWeather from "@/components/Weather/CurrentWeather";
import ProForecast from "@/components/Weather/ProForecast";
import LifestyleGrid from "@/components/Weather/LifestyleGrid";
import WelcomeState from "@/components/Weather/WelcomeState";
import Footer from "@/components/Footer"; // <--- IMPORT FOOTER
import { Button } from "@/components/ui/button";
import { useSearch } from "@/hooks/useSearch";
import { useWeather } from "@/hooks/useWeather";
import { toast } from "sonner";
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
import {
  Locate,
  Star,
  CloudRain,
  Wind,
  Thermometer,
  Cloud,
} from "lucide-react";

const WeatherMap = dynamic(() => import("@/components/Weather/WeatherMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />,
});

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded-md ${className}`} />
);

type MapLayerType =
  | "temp_new"
  | "precipitation_new"
  | "clouds_new"
  | "wind_new";

export default function Page() {
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [mapLayer, setMapLayer] = useState<MapLayerType>("temp_new");
  const [favorites, setFavorites] = useState<Suggestion[]>(() =>
    getFavorites()
  );

  // States for loading and GPS tracking
  const [isLocating, setIsLocating] = useState(false);
  const [isGPS, setIsGPS] = useState(false);

  const toggleFavorite = (loc: Suggestion) => {
    const isFav = favorites.some((f) => f.display === loc.display);
    if (isFav) {
      removeFavorite(loc);
      setFavorites((prev) => prev.filter((f) => f.display !== loc.display));
      toast.success("Removed from favorites");
    } else {
      addFavorite(loc);
      setFavorites((prev) => [...prev, loc]);
      toast.success("Added to favorites");
    }
  };

  const {
    input,
    suggestions,
    selected,
    loadingSuggestions,
    onChange,
    pickSuggestion,
    setSuggestions,
  } = useSearch();

  const {
    weather,
    loadingWeather,
    fiveDayForecast,
    twelveHourForecast,
    getWeather,
    get5DayForecast,
    get12HourForecast,
    setError: setWeatherError,
  } = useWeather(selected, input);

  useEffect(() => {
    if (weather) {
      toast.dismiss();
      get5DayForecast();
      get12HourForecast();
      setIsLocating(false);
    }
  }, [weather]);


  const mapCenter: [number, number] = weather
    ? [weather.coord.lat, weather.coord.lon]
    : [12.8797, 121.774];

  const mapZoom = weather ? 12 : 6;

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      toast.info("Locating you...");

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setIsGPS(true);
          getWeather(latitude, longitude);
          toast.success("Location found!");
        },
        () => {
          setIsLocating(false);
          toast.error("Unable to get current location.");
        }
      );
    } else {
      setWeatherError("Geolocation is not supported.");
      toast.error("Geolocation is not supported.");
    }
  };

  const handlePopularCity = (city: string, lat: number, lon: number) => {
    onChange("");
    setIsLocating(true);
    setIsGPS(false);
    getWeather(lat, lon, city).finally(() => setIsLocating(false));
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    pickSuggestion(suggestion);
    setSuggestions([]);
    setIsLocating(true);
    setIsGPS(false);
    getWeather(suggestion.lat, suggestion.lng, suggestion.display).finally(() =>
      setIsLocating(false)
    );
  };

  const getLayerIcon = (layer: MapLayerType) => {
    switch (layer) {
      case "precipitation_new":
        return <CloudRain className="h-4 w-4" />;
      case "wind_new":
        return <Wind className="h-4 w-4" />;
      case "clouds_new":
        return <Cloud className="h-4 w-4" />;
      default:
        return <Thermometer className="h-4 w-4" />;
    }
  };

  const isLoading = loadingWeather || isLocating;

  return (
    // FIX: Changed structure to flex-col to push Footer to bottom
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* HEADER: Optimized for Mobile & Desktop */}
          <header className="sticky top-0 md:top-4 z-50 bg-background/95 md:bg-card/70 p-4 md:rounded-xl md:border shadow-sm backdrop-blur-md transition-all">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* BLOCK 1: Logo & Mobile Actions */}
              <div className="flex w-full md:w-auto items-center justify-between">
                <h1
                  className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent cursor-pointer"
                  onClick={() => window.location.reload()}
                >
                  ClimaPH
                </h1>

                {/* Mobile-Only Actions (GPS, Favorites, Toggle) - Moves here to save space below */}
                <div className="flex items-center gap-1 md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCurrentLocation}
                    className="h-9 w-9"
                  >
                    <Locate className="h-5 w-5" />
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Star className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm w-full z-[100]">
                      <DialogHeader>
                        <DialogTitle>Saved Locations</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col gap-2 mt-2 max-h-[300px] overflow-y-auto">
                        {favorites.length === 0 && (
                          <p className="text-sm text-center py-4 text-muted-foreground">
                            No favorites yet.
                          </p>
                        )}
                        {favorites.map((fav) => (
                          <DialogTrigger asChild key={fav.display}>
                            <Button
                              variant="ghost"
                              className="justify-start w-full"
                              onClick={() => {
                                setIsGPS(false);
                                getWeather(fav.lat, fav.lng, fav.display);
                              }}
                            >
                              <Star className="mr-2 h-4 w-4 text-yellow-500 fill-yellow-500" />
                              {fav.display}
                            </Button>
                          </DialogTrigger>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <ModeToggle />
                </div>
              </div>

              {/* BLOCK 2: Search Bar (Full width on Mobile) */}
              <div className="relative w-full md:max-w-md lg:max-w-lg">
                <SearchBar
                  input={input}
                  onChange={(e) => onChange(e.target.value)}
                  getWeather={getWeather}
                  loadingWeather={loadingWeather}
                  hasValidSelection={!!selected}
                />

                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 z-[100]">
                    <Suggestions
                      suggestions={suggestions}
                      pickSuggestion={handleSuggestionClick}
                    />
                  </div>
                )}
              </div>

              {/* BLOCK 3: Desktop Actions (Hidden on Mobile) */}
              <div className="hidden md:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCurrentLocation}
                  title="Current Location"
                >
                  <Locate className="h-5 w-5" />
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" title="Favorites">
                      <Star className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm w-full z-[100]">
                    <DialogHeader>
                      <DialogTitle>Saved Locations</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 mt-2 max-h-[300px] overflow-y-auto">
                      {favorites.length === 0 && (
                        <p className="text-sm text-center py-4 text-muted-foreground">
                          No favorites yet.
                        </p>
                      )}
                      {favorites.map((fav) => (
                        <DialogTrigger asChild key={fav.display}>
                          <Button
                            variant="ghost"
                            className="justify-start w-full"
                            onClick={() => {
                              setIsGPS(false);
                              getWeather(fav.lat, fav.lng, fav.display);
                            }}
                          >
                            <Star className="mr-2 h-4 w-4 text-yellow-500 fill-yellow-500" />
                            {fav.display}
                          </Button>
                        </DialogTrigger>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>

                <ModeToggle />
              </div>
            </div>
          </header>

          <main className="space-y-6">
            {!weather && !isLoading ? (
              <WelcomeState
                onUseLocation={handleCurrentLocation}
                onSelectCity={handlePopularCity}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="lg:col-span-1 h-[400px]">
                    <CurrentWeather
                      weather={weather}
                      loading={isLoading}
                      unit={unit}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                    />
                  </div>

                  <div className="lg:col-span-2 h-[400px] rounded-xl overflow-hidden border shadow-sm relative group z-0">
                    <WeatherMap
                      center={mapCenter}
                      zoom={mapZoom}
                      layer={mapLayer}
                    />

                    <div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-1 bg-background/80 p-1 rounded-lg border shadow backdrop-blur-md">
                      {[
                        { id: "temp_new", label: "Temp" },
                        { id: "precipitation_new", label: "Rain" },
                        { id: "wind_new", label: "Wind" },
                        { id: "clouds_new", label: "Clouds" },
                      ].map((layer) => (
                        <Button
                          key={layer.id}
                          size="sm"
                          variant={mapLayer === layer.id ? "default" : "ghost"}
                          className="justify-start h-8 px-2 w-28 text-xs"
                          onClick={() => setMapLayer(layer.id as MapLayerType)}
                        >
                          {getLayerIcon(layer.id as MapLayerType)}
                          <span className="ml-2">{layer.label}</span>
                        </Button>
                      ))}
                    </div>

                    <div className="absolute bottom-4 right-4 z-[400] bg-background/80 p-2 rounded-md shadow backdrop-blur-md">
                      <MapLegend layer={mapLayer} />
                    </div>
                  </div>
                </div>

                {(weather || isLoading) && (
                  <>
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                      {weather && (
                        <LifestyleGrid weather={weather} unit={unit} />
                      )}
                    </div>

                    <div className="mt-6 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                      <ProForecast
                        fiveDay={fiveDayForecast}
                        twelveHour={twelveHourForecast}
                        unit={unit}
                        loading={isLoading}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
