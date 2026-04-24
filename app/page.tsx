"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useAppStore } from "@/store/useAppStore";
import { useSearch } from "@/hooks/useSearch";
import { useWeather } from "@/hooks/useWeather";
import SearchBar from "@/components/search/SearchBar";
import Suggestions from "@/components/search/Suggestions";
import WelcomeState from "@/components/weather/WelcomeState";
import { Skeleton } from "@/components/ui/skeleton";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { LocateFixed } from "lucide-react";
import { toast } from "sonner";
import type { Suggestion } from "@/types/types";

// Dynamic imports delegate loading states to React Suspense boundaries
const CurrentWeather = dynamic(() => import("@/components/weather/CurrentWeather"), { ssr: true });
const ForecastCarousel = dynamic(() => import("@/components/weather/ForecastCarousel"), { ssr: false });
const ProForecast = dynamic(() => import("@/components/weather/ProForecast"), { ssr: false });
const LifestyleGrid = dynamic(() => import("@/components/weather/LifestyleGrid"), { ssr: false });
const TomorrowPreview = dynamic(() => import("@/components/weather/TomorrowPreview"), { ssr: false });
const SolarProgression = dynamic(() => import("@/components/weather/SolarProgression"), { ssr: false });
const UvIndexCard = dynamic(() => import("@/components/weather/UnIndexCard"), { ssr: false });

export default function DashboardPage() {
  const { targetLocation, setTargetLocation, hasCompletedOnboarding } = useAppStore();
  const { input, suggestions, onChange, pickSuggestion, setSuggestions } = useSearch();
  const { weather, loadingWeather, getWeather } = useWeather();
  const [isLocating, setIsLocating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (loadingWeather || !weather) {
      return { line1: "Magandang araw!", line2: "Kinukuha ang impormasyon..." };
    }
    
    const desc = (
      weather.current?.condition?.text ||
      weather.current?.weather?.[0]?.description ||
      ""
    ).toLowerCase();

    if (desc.includes("rain") || desc.includes("drizzle")) {
      return {
        line1: "Maulan ngayon!",
        line2: "Wag kalimutang magdala ng payong.",
      };
    }
    if (desc.includes("sun") || desc.includes("clear")) {
      return {
        line1: "Mainit ang sikat ng araw!",
        line2: "Uminom ng maraming tubig.",
      };
    }
    if (desc.includes("cloud")) {
      return {
        line1: "Maulap ngayon.",
        line2: "Magandang araw para mamasyal!",
      };
    }
    if (desc.includes("thunder") || desc.includes("storm")) {
      return {
        line1: "May badya ng kulog at kidlat.",
        line2: "Ingat po palagi!",
      };
    }

    return { line1: "Magandang araw!", line2: "Ingat sa byahe mo ngayon." };
  };

  if (!mounted) {
    return null; 
  }

  const greeting = getWeatherGreeting();

  return (
    <>
      {!hasCompletedOnboarding && <WelcomeState />}
      
      <div className="flex flex-col xl:flex-row w-full min-h-full font-sans">
        <div className="flex-1 flex flex-col min-w-0 bg-background p-4 md:p-6 lg:p-8 xl:p-10">
          <header className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 shrink-0 mb-6 md:mb-8 xl:mb-10 mt-2 lg:mt-0">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden shrink-0 shadow-sm border border-border/40">
                <Image
                  src="/placeholder-avatar.webp"
                  alt="Default user profile avatar representing the currently authenticated session"
                  fill
                  sizes="(max-width: 768px) 48px, 56px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center" aria-live="polite" role="status">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  {greeting.line1}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground font-medium mt-0.5">
                  {greeting.line2}
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 md:gap-3 w-full lg:max-w-md z-50 h-10 md:h-12" role="search">
              <div className="relative flex-1 h-full">
                <div className="h-full bg-card border border-border/60 shadow-sm rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-[#0038A8]/20">
                  <SearchBar
                    input={input}
                    onChange={(e) => onChange(e.target.value)}
                    getWeather={() => getWeather(undefined, undefined, input)}
                    loadingWeather={loadingWeather}
                    hasValidSelection={!!targetLocation}
                    aria-expanded={suggestions.length > 0}
                    aria-controls="search-suggestions"
                  />
                </div>
                <LazyMotion features={domAnimation}>
                  <AnimatePresence>
                    {suggestions.length > 0 && (
                      <m.div
                        id="search-suggestions"
                        initial={{ opacity: 0, y: 4, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.99 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-[calc(100%+8px)] shadow-xl z-50"
                        role="listbox"
                      >
                        <div className="overflow-hidden rounded-xl border border-border/40 bg-background/95 backdrop-blur-md">
                          <Suggestions
                            suggestions={suggestions}
                            pickSuggestion={handleSuggestionClick}
                          />
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </LazyMotion>
              </div>
              <button
                onClick={handleCurrentLocation}
                disabled={isLocating}
                className="h-full aspect-square flex items-center justify-center rounded-full bg-[#0038A8] text-white hover:bg-[#002776] transition-all duration-200 shadow-md shrink-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0038A8]"
                aria-label="Detect and use current geographic location"
                aria-busy={isLocating}
              >
                <LocateFixed
                  className={`w-4 h-4 md:w-5 md:h-5 stroke-[2] ${isLocating ? "animate-spin text-[#FCD116]" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </header>

          <main className="flex flex-col gap-4 md:gap-6 lg:gap-8 w-full" aria-label="Main Weather Dashboard">
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6 w-full shrink-0 items-stretch">
              <section className="flex-1 min-w-0 rounded-[1.5rem] md:rounded-[2rem] bg-card border border-border/40 shadow-sm p-4 md:p-6 lg:p-8 lg:min-h-[380px] flex flex-col relative overflow-hidden transition-all hover:shadow-md" aria-labelledby="current-weather-heading">
                <h2 id="current-weather-heading" className="sr-only">Current Weather Conditions</h2>
                <Suspense fallback={<Skeleton className="w-full h-full min-h-[300px] rounded-xl" />}>
                  <CurrentWeather />
                </Suspense>
              </section>

              <section className="flex-1 min-w-0 rounded-[1.5rem] md:rounded-[2rem] bg-card border border-border/40 shadow-sm p-4 md:p-6 lg:p-8 lg:min-h-[380px] flex flex-col relative overflow-hidden transition-all hover:shadow-md" aria-labelledby="lifestyle-grid-heading">
                <h2 id="lifestyle-grid-heading" className="sr-only">Lifestyle and Activity Index</h2>
                <Suspense fallback={<Skeleton className="w-full h-full min-h-[300px] rounded-xl" />}>
                  <LifestyleGrid />
                </Suspense>
              </section>
            </div>

            <div className="w-full shrink-0 flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-10 mt-2 md:mt-4">
              <section className="flex-1 flex flex-col min-w-0" aria-label="Hourly Forecast">
                <Suspense fallback={<Skeleton className="w-full h-[200px] rounded-xl" />}>
                  <ForecastCarousel />
                </Suspense>
              </section>

              <section className="w-full md:w-[220px] lg:w-[250px] xl:w-[275px] shrink-0 rounded-[1.5rem] md:rounded-[2rem] bg-card border border-border/40 shadow-sm p-4 md:p-6 flex flex-col justify-between items-center text-center hover:shadow-md transition-all" aria-label="Tomorrow Preview">
                <Suspense fallback={<Skeleton className="w-full h-[200px] rounded-xl" />}>
                  <TomorrowPreview />
                </Suspense>
              </section>
            </div>
          </main>
        </div>

        <aside className="w-full xl:w-[340px] 2xl:w-[440px] shrink-0 bg-muted/40 border-t xl:border-t-0 xl:border-l border-border/30 p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col gap-6 lg:gap-8 min-h-full" aria-label="Secondary Weather Metrics">
          <section className="w-full shrink-0 flex items-center justify-center my-2 md:my-4" aria-label="Solar Progression">
            <Suspense fallback={<Skeleton className="w-[150px] h-[150px] rounded-full" />}>
              <SolarProgression />
            </Suspense>
          </section>

          <section className="w-full shrink-0" aria-label="UV Index">
            <Suspense fallback={<Skeleton className="w-full h-[120px] rounded-xl" />}>
              <UvIndexCard />
            </Suspense>
          </section>

          <section className="w-full flex-1 flex flex-col min-h-[250px] md:min-h-[300px]" aria-labelledby="weather-prediction-heading">
            <h2 id="weather-prediction-heading" className="text-base md:text-lg font-semibold tracking-tight text-foreground mb-3 md:mb-4 shrink-0" style={{ fontFamily: "var(--font-instrument-sans), sans-serif" }}>
              Weather Prediction
            </h2>
            <div className="w-full flex-1 overflow-y-auto scrollbar-hide pb-4">
              <Suspense fallback={<Skeleton className="w-full h-[300px] rounded-xl" />}>
                <ProForecast />
              </Suspense>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}