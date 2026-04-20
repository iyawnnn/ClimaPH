"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppStore } from "@/store/useAppStore";
import { useSearch } from "@/hooks/useSearch";
import { useWeather } from "@/hooks/useWeather";
import CurrentWeather from "@/components/weather/CurrentWeather";
import ForecastCarousel from "@/components/weather/ForecastCarousel";
import ProForecast from "@/components/weather/ProForecast";
import LifestyleGrid from "@/components/weather/LifestyleGrid";
import SearchBar from "@/components/search/SearchBar";
import Suggestions from "@/components/search/Suggestions";
import { motion, AnimatePresence } from "framer-motion";
import type { Suggestion } from "@/types/types";

const WeatherMap = dynamic(
  () => import("@/components/weather/WeatherMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-card border border-border/40 rounded-3xl animate-pulse">
        <span className="text-sm text-muted-foreground">Loading Telemetry...</span>
      </div>
    )
  }
);

export default function DashboardPage() {
  const { targetLocation, setTargetLocation } = useAppStore();
  const { input, suggestions, onChange, pickSuggestion, setSuggestions } = useSearch();
  const { weather, loadingWeather, getWeather } = useWeather();

  useEffect(() => {
    if (targetLocation && !weather && !loadingWeather) {
      getWeather(targetLocation.lat, targetLocation.lon);
    }
  }, [targetLocation, weather, loadingWeather, getWeather]);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    pickSuggestion(suggestion);
    setSuggestions([]);
    setTargetLocation(suggestion);
  };

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto gap-8 pb-12">
      
      <header className="w-full flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Kumusta! Kape muna bago mag-compile.
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {targetLocation 
              ? `Displaying telemetry for ${targetLocation.display}` 
              : "Awaiting location input to initialize dashboard."}
          </p>
        </div>

        <div className="relative w-full md:max-w-md z-50">
          <SearchBar
            input={input}
            onChange={(e) => onChange(e.target.value)}
            getWeather={() => getWeather(undefined, undefined, input)}
            loadingWeather={loadingWeather}
            hasValidSelection={!!targetLocation}
          />

          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-[calc(100%+12px)] shadow-xl"
              >
                <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
                  <Suggestions
                    suggestions={suggestions}
                    pickSuggestion={handleSuggestionClick}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="flex flex-col xl:flex-row gap-8">
        
        <div className="flex-1 flex flex-col gap-8">
          <section className="w-full rounded-3xl bg-card border border-border/40 shadow-sm p-8 min-h-[320px] flex flex-col relative overflow-hidden">
            <CurrentWeather />
          </section>
          
          <section className="w-full">
            <h2 className="text-sm font-medium text-foreground mb-4">Today's Sequence</h2>
            <div className="w-full rounded-3xl bg-card border border-border/40 shadow-sm p-6">
              <ForecastCarousel />
            </div>
          </section>

          <section className="w-full">
            <h2 className="text-sm font-medium text-foreground mb-4">7-Day Projection</h2>
            <div className="w-full rounded-3xl bg-card border border-border/40 shadow-sm p-6">
              <ProForecast />
            </div>
          </section>
        </div>

        <div className="w-full xl:w-[420px] 2xl:w-[480px] shrink-0 flex flex-col gap-8">
          <section className="w-full">
             <h2 className="text-sm font-medium text-foreground mb-4">Environmental Status</h2>
             <LifestyleGrid />
          </section>
          
          <section className="w-full h-[300px] xl:h-[400px] rounded-3xl bg-card border border-border/40 shadow-sm overflow-hidden relative">
             <WeatherMap />
          </section>
        </div>

      </div>
    </div>
  );
}