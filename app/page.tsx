"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useSearch } from "@/hooks/useSearch";
import { useWeather } from "@/hooks/useWeather";
import SearchBar from "@/components/search/SearchBar";
import Suggestions from "@/components/search/Suggestions";
import WelcomeState from "@/components/weather/WelcomeState";
import CurrentWeather from "@/components/weather/CurrentWeather";
import LifestyleGrid from "@/components/weather/LifestyleGrid";
import ProForecast from "@/components/weather/ProForecast";
import CommuterIndex from "@/components/weather/CommuterIndex";
import LifestyleChecker from "@/components/weather/LifestyleChecker";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFavorites } from "@/lib/favorites";
import { toast } from "sonner";
import { 
  CloudLightning, LayoutDashboard, Map as MapIcon, 
  Star, Activity, LocateFixed, User 
} from "lucide-react";
import type { Suggestion } from "@/types/types";

const WeatherMap = dynamic(() => import("@/components/weather/WeatherMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted/30 rounded-3xl" />,
});

type MapLayerType = "temp_new" | "precipitation_new" | "clouds_new" | "wind_new";

export default function Page() {
  const { isCrisisMode, toggleCrisisMode, unit, mapLayer, setTargetLocation, targetLocation } = useAppStore();
  const { weather, loadingWeather, fiveDayForecast, twelveHourForecast, getWeather } = useWeather();
  const { input, suggestions, onChange, pickSuggestion, setSuggestions } = useSearch();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [favorites, setFavorites] = useState<Suggestion[]>([]);
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

  const handleSuggestionClick = (suggestion: Suggestion) => {
    pickSuggestion(suggestion);
    setSuggestions([]);
    setTargetLocation(suggestion);
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden bg-background ${isCrisisMode ? 'font-mono' : ''}`}>
      
      {/* 1. Icon-Only Persistent Sidebar */}
      <aside className="hidden w-20 flex-col items-center border-r border-border/40 bg-muted/10 py-6 lg:flex supports-[backdrop-filter]:bg-background/60 supports-[backdrop-filter]:backdrop-blur-3xl z-40">
        
        {/* Minimal Logo Mark */}
        <div 
          className="mb-8 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105"
          onClick={() => window.location.reload()}
          title="Reset Dashboard"
        >
          <CloudLightning className="h-5 w-5" />
        </div>

        {/* Primary Navigation */}
        <nav className="flex flex-col gap-4 w-full px-4">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "map", icon: MapIcon, label: "Radar Maps" },
            { id: "favorites", icon: Star, label: "Anchored Nodes" },
          ].map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              size="icon"
              className={`h-12 w-12 rounded-xl transition-all ${
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-foreground/70 hover:bg-muted/50 hover:text-foreground"
              }`}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
            >
              <item.icon className="h-5 w-5" />
            </Button>
          ))}
        </nav>

        {/* Bottom System Controls */}
        <div className="mt-auto flex flex-col gap-4 items-center">
          <div className="rounded-xl border border-border/40 bg-background/50 p-1 shadow-sm">
            <ModeToggle />
          </div>
          
          <Button
            variant={isCrisisMode ? "destructive" : "ghost"}
            size="icon"
            className={`h-12 w-12 rounded-xl transition-all ${
              isCrisisMode 
                ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 animate-pulse" 
                : "text-foreground/70 hover:bg-destructive/10 hover:text-destructive"
            }`}
            onClick={toggleCrisisMode}
            title={isCrisisMode ? "Disable Crisis Mode" : "Activate Crisis Mode"}
          >
            <Activity className="h-5 w-5" />
          </Button>
        </div>
      </aside>

      {/* 2. Main Work Area */}
      <main className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className="mx-auto w-full max-w-[1600px] p-4 md:p-8 space-y-8">
          
          {/* Header Context Line */}
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
            
            {/* Left: Dynamic Greeting with Placeholder Avatar */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 cursor-pointer border border-border/50 transition-transform hover:scale-105 shrink-0 sm:block hidden">
                  <AvatarImage src="/placeholder-avatar.webp" alt="User Profile" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                    Kumusta! Kape muna bago mag-compile.
                </h1>
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                {weather ? `Meteorological telemetry locked for ${weather.name}.` : "Awaiting location input to initialize dashboard."}
              </p>
            </div>

            {/* Center: Mathematically Centered Search */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block w-full max-w-md z-50">
              <div className="h-10 rounded-lg bg-muted/20 border border-border/60 transition-all focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
                  <SearchBar
                    input={input}
                    onChange={(e) => onChange(e.target.value)}
                    getWeather={() => getWeather(undefined, undefined, input)}
                    loadingWeather={loadingWeather || isLocating}
                    hasValidSelection={!!targetLocation}
                  />
                </div>
                
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute left-0 top-[calc(100%+8px)] w-full shadow-2xl"
                    >
                      <div className="overflow-hidden rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl">
                        <Suggestions suggestions={suggestions} pickSuggestion={handleSuggestionClick} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>

            {/* Right: GPS and Menu */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={handleCurrentLocation}
                className="h-10 w-10 shrink-0 rounded-lg border-border/60 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                title="Initialize GPS"
              >
                <LocateFixed className="h-4 w-4" />
              </Button>

              <div className="h-6 w-[1px] bg-border/60 mx-1 hidden sm:block" />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden h-10 w-10 rounded-full text-foreground hover:bg-primary/10 hover:text-primary transition-colors focus-visible:ring-0"
                aria-label="Open Menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="9" y1="12" x2="21" y2="12"></line>
                  <line x1="14" y1="18" x2="21" y2="18"></line>
                </svg>
              </Button>
            </div>
          </header>

          {/* 3. The Separated Bento Architecture */}
          {!weather && !loadingWeather ? (
            <div className="pt-12">
              <WelcomeState 
                onUseLocation={handleCurrentLocation} 
                onSelectCity={(city, lat, lng) => setTargetLocation({ display: city, lat, lng })} 
              />
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="grid grid-cols-1 gap-6 lg:grid-cols-12 auto-rows-min"
            >
              
              {/* Primary Content Column (Left/Center) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Top Split: Current Weather & Map */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="min-h-[400px]">
                    <CurrentWeather weather={weather} loading={loadingWeather} unit={unit} favorites={favorites} toggleFavorite={() => {}} />
                  </div>
                  
                  {!isCrisisMode && (
                    <div className="min-h-[400px] rounded-3xl border border-border/40 bg-card overflow-hidden shadow-sm relative group">
                      <WeatherMap 
                        center={weather ? [weather.coord.lat, weather.coord.lon] : [15.0286, 120.6925]} 
                        zoom={weather ? 12 : 6} 
                        layer={mapLayer as MapLayerType} 
                      />
                    </div>
                  )}
                </div>

                {/* Subsystem Analytics */}
                <div className="w-full">
                  <ProForecast fiveDay={fiveDayForecast ?? []} twelveHour={twelveHourForecast ?? []} unit={unit} loading={loadingWeather} />
                </div>
              </div>

              {/* Secondary Widget Column (Right Side) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {weather && (
                  <div className="rounded-3xl border border-border/40 bg-card shadow-sm p-6">
                    <LifestyleGrid weather={weather} unit={unit} />
                  </div>
                )}
                
                {fiveDayForecast && (
                  <>
                    <div className="rounded-3xl border border-border/40 bg-card shadow-sm p-6">
                      <CommuterIndex forecastList={fiveDayForecast} />
                    </div>
                    <div className="rounded-3xl border border-border/40 bg-card shadow-sm p-6">
                      <LifestyleChecker forecastList={fiveDayForecast} />
                    </div>
                  </>
                )}
              </div>

            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}