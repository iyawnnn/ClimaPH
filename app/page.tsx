"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useWeather } from "@/hooks/useWeather";
import CurrentWeather from "@/components/weather/CurrentWeather";
import LifestyleGrid from "@/components/weather/LifestyleGrid";
import ProForecast from "@/components/weather/ProForecast";
import CommuterIndex from "@/components/weather/CommuterIndex";
import LifestyleChecker from "@/components/weather/LifestyleChecker";
import ForecastCarousel from "@/components/weather/ForecastCarousel"; // Re-added this
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFavorites } from "@/lib/favorites";
import { toast } from "sonner";
import { User, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";

const WeatherMap = dynamic(() => import("@/components/weather/WeatherMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-card/10 rounded-3xl" />,
});

type MapLayerType = "temp_new" | "precipitation_new" | "clouds_new" | "wind_new";

export default function DashboardPage() {
  const { isCrisisMode, unit, mapLayer, setTargetLocation, targetLocation } = useAppStore();
  const { weather, loadingWeather, fiveDayForecast, twelveHourForecast, getWeather } = useWeather();
  const [favorites, setFavorites] = useState([]);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation services offline.");
      return;
    }
    setIsLocating(true);
    toast.info("Acquiring GPS satellite lock...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getWeather(pos.coords.latitude, pos.coords.longitude);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        toast.error("GPS lock failed.");
      }
    );
  };

  return (
    <div className={`w-full max-w-[1600px] mx-auto h-full flex flex-col xl:flex-row gap-6 lg:gap-8 ${isCrisisMode ? 'font-mono' : ''}`}>
      
      {/* LEFT COLUMN: Header + Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header - Constrained to Left Column */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/20 shrink-0">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border border-border/50 shrink-0">
              <AvatarImage src="/placeholder-avatar.webp" alt="User Profile" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground font-sans">
                Kumusta! Kape muna bago mag-compile.
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                {weather ? `Telemetry locked for ${weather.name}.` : "Awaiting location input."}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleCurrentLocation}
            className="h-10 w-10 shrink-0 rounded-lg border-border/60 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all shadow-sm hidden sm:flex"
            title="Initialize GPS"
          >
            <LocateFixed className="h-4 w-4" />
          </Button>
        </header>

        {/* Left Column Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pt-6 pb-12 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[340px]">
            <section className="h-full rounded-3xl border border-border/20 bg-card/10 backdrop-blur-md shadow-sm p-6 flex flex-col justify-center">
              <CurrentWeather weather={weather} loading={loadingWeather} unit={unit} favorites={favorites} toggleFavorite={() => {}} />
            </section>
            
            {!isCrisisMode && (
              <section className="h-full min-h-[340px] rounded-3xl border border-border/20 bg-card/10 backdrop-blur-md overflow-hidden shadow-sm relative">
                <WeatherMap 
                  center={weather ? [weather.coord.lat, weather.coord.lon] : [15.0286, 120.6925]} 
                  zoom={weather ? 12 : 6} 
                  layer={mapLayer as MapLayerType} 
                />
              </section>
            )}
          </div>

          {/* ADDED: ForecastCarousel implementation wrapped in null check */}
          {fiveDayForecast && (
            <section className="w-full rounded-3xl border border-border/20 bg-card/10 backdrop-blur-md shadow-sm p-6">
               <h2 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest font-sans">Today's Sequence</h2>
               {/* Safety check before passing data */}
               <ForecastCarousel data={fiveDayForecast || {}} unit={unit} />
            </section>
          )}

          <section className="w-full rounded-3xl border border-border/20 bg-card/10 backdrop-blur-md shadow-sm p-6 min-h-[350px]">
             <h2 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest font-sans">7-Day Projection</h2>
             <ProForecast fiveDay={fiveDayForecast ?? []} twelveHour={twelveHourForecast ?? []} unit={unit} loading={loadingWeather} />
          </section>

        </div>
      </div>

      {/* RIGHT COLUMN: Dedicated Side Panel (Matches the right edge of image) */}
      <div className="w-full xl:w-[420px] 2xl:w-[480px] shrink-0 h-full overflow-y-auto scrollbar-hide xl:pb-12 xl:pt-4 flex flex-col gap-6">
        
        {weather && (
          <div className="rounded-3xl border border-border/20 bg-card/10 backdrop-blur-md shadow-sm p-6">
            <LifestyleGrid weather={weather} unit={unit} />
          </div>
        )}
        
        {fiveDayForecast && (
          <>
            <div className="rounded-3xl border border-border/20 bg-card/10 backdrop-blur-md shadow-sm p-6">
              <CommuterIndex forecastList={fiveDayForecast} />
            </div>
            <div className="rounded-3xl border border-border/20 bg-card/10 backdrop-blur-md shadow-sm p-6">
              <LifestyleChecker forecastList={fiveDayForecast} />
            </div>
          </>
        )}

      </div>
    </div>
  );
}