"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import SiteHeader from "@/components/layout/SiteHeader";
import WelcomeState from "@/components/weather/WelcomeState";
import CurrentWeather from "@/components/weather/CurrentWeather";
import LifestyleGrid from "@/components/weather/LifestyleGrid";
import CommuterIndex from "@/components/weather/CommuterIndex";
import LifestyleChecker from "@/components/weather/LifestyleChecker";
import ProForecast from "@/components/weather/ProForecast";
import Footer from "@/components/Footer";
import MapLegend from "@/components/MapLegend";
import { Button } from "@/components/ui/button";
import { useWeather } from "@/hooks/useWeather";
import { useAppStore } from "@/store/useAppStore";
import { getFavorites, addFavorite, removeFavorite } from "@/lib/favorites";
import { toast } from "sonner";
import { CloudRain, Wind, Thermometer, Cloud } from "lucide-react";
import type { Suggestion } from "@/types/types";

const WeatherMap = dynamic(() => import("@/components/weather/WeatherMap"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-muted rounded-xl h-[400px] w-full" />,
});

type MapLayerType = "temp_new" | "precipitation_new" | "clouds_new" | "wind_new";

export default function Page() {
  const { isCrisisMode, unit, mapLayer, setMapLayer, setTargetLocation } = useAppStore();
  const { weather, loadingWeather, fiveDayForecast, twelveHourForecast, getWeather } = useWeather();
  const [favorites, setFavorites] = useState<Suggestion[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

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

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.info("Locating you...");
      navigator.geolocation.getCurrentPosition(
        (pos) => getWeather(pos.coords.latitude, pos.coords.longitude),
        () => toast.error("Unable to get current location.")
      );
    }
  };

  const getLayerIcon = (layer: MapLayerType) => {
    switch (layer) {
      case "precipitation_new": return <CloudRain className="h-4 w-4" />;
      case "wind_new": return <Wind className="h-4 w-4" />;
      case "clouds_new": return <Cloud className="h-4 w-4" />;
      default: return <Thermometer className="h-4 w-4" />;
    }
  };

  const isLoading = loadingWeather;
  const animationClass = isCrisisMode ? "" : "animate-in fade-in slide-in-from-bottom-4 duration-500";
  const mapCenter: [number, number] = weather ? [weather.coord.lat, weather.coord.lon] : [12.8797, 121.774];
  const mapZoom = weather ? 12 : 6;

  return (
    <div className={`min-h-screen bg-background flex flex-col ${isCrisisMode ? 'font-mono transition-none' : 'transition-colors'}`}>
      
      {isCrisisMode && (
        <div className="w-full bg-red-600 dark:bg-red-900 text-white text-xs py-1 text-center font-bold uppercase tracking-widest">
          Crisis Mode Active — Map Disabled — Bandwidth Optimized
        </div>
      )}

      <div className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <SiteHeader />

          <main className="space-y-6">
            {!weather && !isLoading ? (
              <WelcomeState
                onUseLocation={handleCurrentLocation}
                onSelectCity={(city, lat, lng) => setTargetLocation({ display: city, lat, lng })}
              />
            ) : (
              <>
                <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${animationClass}`}>
                  <div className={`lg:col-span-1 ${isCrisisMode ? 'h-auto' : 'h-[400px]'}`}>
                    <CurrentWeather
                      weather={weather}
                      loading={isLoading}
                      unit={unit}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                    />
                  </div>

                  {!isCrisisMode && (
                    <div className="lg:col-span-2 h-[400px] rounded-xl overflow-hidden border shadow-sm relative group z-0">
                      <WeatherMap center={mapCenter} zoom={mapZoom} layer={mapLayer as MapLayerType} />

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
                            onClick={() => setMapLayer(layer.id)}
                          >
                            {getLayerIcon(layer.id as MapLayerType)}
                            <span className="ml-2">{layer.label}</span>
                          </Button>
                        ))}
                      </div>

                      <div className="absolute bottom-4 right-4 z-[400] bg-background/80 p-2 rounded-md shadow backdrop-blur-md">
                        <MapLegend layer={mapLayer as MapLayerType} />
                      </div>
                    </div>
                  )}
                </div>

                {(weather || isLoading) && (
                  <div className={`space-y-6 mt-6 ${animationClass}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        {weather && <LifestyleGrid weather={weather} unit={unit} />}
                      </div>
                      <div className="lg:col-span-1 flex flex-col gap-6">
                        {fiveDayForecast && (
                          <>
                            <CommuterIndex forecastList={fiveDayForecast} />
                            <LifestyleChecker forecastList={fiveDayForecast} />
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <ProForecast
                        fiveDay={fiveDayForecast ?? []}
                        twelveHour={twelveHourForecast ?? []}
                        unit={unit}
                        loading={isLoading}
                      />
                    </div>
                  </div>
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