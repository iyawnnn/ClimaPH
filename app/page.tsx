"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAppStore } from "@/store/useAppStore";
import { useSearch } from "@/hooks/useSearch";
import { useWeather } from "@/hooks/useWeather";
import CurrentWeather from "@/components/weather/CurrentWeather";
import ForecastCarousel from "@/components/weather/ForecastCarousel";
import ProForecast from "@/components/weather/ProForecast";
import LifestyleGrid from "@/components/weather/LifestyleGrid";
import TomorrowPreview from "@/components/weather/TomorrowPreview";
import SolarProgression from "@/components/weather/SolarProgression";
import UvIndexCard from "@/components/weather/UnIndexCard";
import SearchBar from "@/components/search/SearchBar";
import Suggestions from "@/components/search/Suggestions";
import { motion, AnimatePresence } from "framer-motion";
import { LocateFixed } from "lucide-react";
import { toast } from "sonner";
import type { Suggestion } from "@/types/types";

export default function DashboardPage() {
  const { targetLocation, setTargetLocation } = useAppStore();
  const { input, suggestions, onChange, pickSuggestion, setSuggestions } =
    useSearch();
  const { weather, loadingWeather, getWeather } = useWeather();
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (targetLocation && !weather && !loadingWeather) {
      const safeLon =
        targetLocation.lon ??
        (targetLocation as any).lng ??
        (targetLocation as any).longitude;

      if (safeLon !== undefined) {
        getWeather(targetLocation.lat, safeLon);
      } else {
        console.error("Longitude mapping failed for payload:", targetLocation);
      }
    }
  }, [targetLocation, weather, loadingWeather, getWeather]);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    pickSuggestion(suggestion);
    setSuggestions([]);
    setTargetLocation(suggestion);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation services are unavailable.");
      return;
    }
    setIsLocating(true);
    toast.info("Acquiring GPS lock...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getWeather(pos.coords.latitude, pos.coords.longitude);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        toast.error("Failed to retrieve coordinates.");
      },
    );
  };

  const getWeatherGreeting = () => {
    if (loadingWeather || !weather)
      return { line1: "Magandang araw!", line2: "Kinukuha ang impormasyon..." };
    const desc = (
      weather.current?.condition?.text ||
      weather.current?.weather?.[0]?.description ||
      ""
    ).toLowerCase();

    if (desc.includes("rain") || desc.includes("drizzle"))
      return {
        line1: "Maulan ngayon!",
        line2: "Wag kalimutang magdala ng payong.",
      };
    if (desc.includes("sun") || desc.includes("clear"))
      return {
        line1: "Mainit ang sikat ng araw!",
        line2: "Uminom ng maraming tubig.",
      };
    if (desc.includes("cloud"))
      return {
        line1: "Maulap ngayon.",
        line2: "Magandang araw para mamasyal!",
      };
    if (desc.includes("thunder") || desc.includes("storm"))
      return {
        line1: "May badya ng kulog at kidlat.",
        line2: "Ingat po palagi!",
      };

    return { line1: "Magandang araw!", line2: "Ingat sa byahe mo ngayon." };
  };

  return (
    <div className="flex flex-col xl:flex-row w-full min-h-full font-sans">
      {/* Main Left Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background p-4 md:p-6 lg:p-8 xl:p-10">
        {/* Header Section */}
        <header className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 shrink-0 mb-6 md:mb-8 xl:mb-10 mt-2 lg:mt-0">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden shrink-0 shadow-sm border border-border/40">
              <Image
                src="/placeholder-avatar.webp"
                alt="Profile picture of the user"
                fill
                sizes="(max-width: 768px) 48px, 56px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                {getWeatherGreeting().line1}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground font-medium mt-0.5">
                {getWeatherGreeting().line2}
              </p>
            </div>
          </div>

          {/* Search container - Hidden on mobile, visible on desktop (lg) */}
          <div className="hidden lg:flex items-center gap-2 md:gap-3 w-full lg:max-w-md z-50 h-10 md:h-12">
            <div className="relative flex-1 h-full">
              <div className="h-full bg-card border border-border/60 shadow-sm rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-[#0038A8]/20">
                <SearchBar
                  input={input}
                  onChange={(e) => onChange(e.target.value)}
                  getWeather={() => getWeather(undefined, undefined, input)}
                  loadingWeather={loadingWeather}
                  hasValidSelection={!!targetLocation}
                />
              </div>
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.99 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-[calc(100%+8px)] shadow-xl z-50"
                  >
                    {/* The overflow-hidden here is critical to crop any escaping child elements */}
                    <div className="overflow-hidden rounded-xl border border-border/40 bg-background/95 backdrop-blur-md">
                      <Suggestions
                        suggestions={suggestions}
                        pickSuggestion={handleSuggestionClick}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={handleCurrentLocation}
              disabled={isLocating}
              className="h-full aspect-square flex items-center justify-center rounded-full bg-[#0038A8] text-white hover:bg-[#002776] transition-all duration-200 shadow-md shrink-0"
              aria-label="Use current location"
            >
              <LocateFixed
                className={`w-4 h-4 md:w-5 md:h-5 stroke-[2] ${isLocating ? "animate-spin text-[#FCD116]" : ""}`}
              />
            </button>
          </div>
        </header>

        {/* Primary Dashboard Grid */}
        <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 w-full">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 w-full shrink-0 items-stretch">
            <section className="flex-1 min-w-0 rounded-[1.5rem] md:rounded-[2rem] bg-card border border-border/40 shadow-sm p-4 md:p-6 lg:p-8 lg:min-h-[380px] flex flex-col relative overflow-hidden transition-all hover:shadow-md">
              <CurrentWeather />
            </section>

            <section className="flex-1 min-w-0 rounded-[1.5rem] md:rounded-[2rem] bg-card border border-border/40 shadow-sm p-4 md:p-6 lg:p-8 lg:min-h-[380px] flex flex-col relative overflow-hidden transition-all hover:shadow-md">
              <LifestyleGrid />
            </section>
          </div>

          <section className="w-full shrink-0 flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-10 mt-2 md:mt-4">
            <div className="flex-1 flex flex-col min-w-0">
              <ForecastCarousel />
            </div>

            <div className="w-full md:w-[220px] lg:w-[250px] xl:w-[275px] shrink-0 rounded-[1.5rem] md:rounded-[2rem] bg-card border border-border/40 shadow-sm p-4 md:p-6 flex flex-col justify-between items-center text-center hover:shadow-md transition-all">
              <TomorrowPreview />
            </div>
          </section>
        </div>
      </div>

      {/* Right Sidebar Area (Fluid Width on Desktop) */}
      <div className="w-full xl:w-[340px] 2xl:w-[440px] shrink-0 bg-muted/40 border-t xl:border-t-0 xl:border-l border-border/30 p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col gap-6 lg:gap-8 min-h-full">
        <section className="w-full shrink-0 flex items-center justify-center my-2 md:my-4">
          <SolarProgression />
        </section>

        <section className="w-full shrink-0">
          <UvIndexCard />
        </section>

        <section className="w-full flex-1 flex flex-col min-h-[250px] md:min-h-[300px]">
          <h2 className="text-base md:text-lg font-semibold tracking-tight text-foreground mb-3 md:mb-4 shrink-0">
            Weather Prediction
          </h2>
          <div className="w-full flex-1 overflow-y-auto scrollbar-hide pb-4">
            <ProForecast />
          </div>
        </section>
      </div>
    </div>
  );
}
