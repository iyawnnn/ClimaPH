"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useAppStore } from "@/store/useAppStore";
import { useSearch } from "@/hooks/useSearch";
import SearchBar from "@/components/search/SearchBar";
import Suggestions from "@/components/search/Suggestions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LocateFixed, Moon, Sun, Monitor, MapPin } from "lucide-react";
import type { Suggestion } from "@/types/types";

export default function WelcomeState() {
  const { setTheme, theme } = useTheme();
  const { setTargetLocation, completeOnboarding } = useAppStore();
  const { input, suggestions, onChange, pickSuggestion } = useSearch();
  const [step, setStep] = useState(1);
  const [isLocating, setIsLocating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation services are unavailable.");
      return;
    }

    setIsLocating(true);
    toast.info("Acquiring satellite lock...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        
        try {
          const apiKey = process.env.NEXT_PUBLIC_OWM_API_KEY;
          const res = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`
          );
          
          if (!res.ok) throw new Error("Reverse geocoding failed");
          const data = await res.json();
          
          const locationName = data[0]?.name || "Local Node";
          
          setTargetLocation({
            display: locationName,
            lat: latitude,
            lon: longitude,
          });
          completeOnboarding();
        } catch (error) {
          setTargetLocation({
            display: "Local Node",
            lat: latitude,
            lon: longitude,
          });
          completeOnboarding();
        }
      },
      () => {
        setIsLocating(false);
        toast.error("Coordinate retrieval failed. Please allow location access.");
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSuggestionSelection = (suggestion: Suggestion) => {
    pickSuggestion(suggestion);
    setTargetLocation(suggestion);
    completeOnboarding();
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/60 backdrop-blur-xl p-4 sm:p-6"
      style={{ fontFamily: '"Instrument Sans", sans-serif' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -15 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-lg rounded-[2rem] border border-border/50 bg-background/95 shadow-2xl p-6 sm:p-10 flex flex-col items-center gap-8 text-center relative overflow-visible backdrop-blur-2xl"
        >
          {step === 1 && (
            <div className="flex w-full flex-col items-center gap-8">
              <div className="flex flex-col items-center justify-center gap-6">
                <Image
                  src="/climaph-brand-logo.webp"
                  alt="ClimaPH Brand Logo"
                  width={140}
                  height={32}
                  className="object-contain"
                  priority
                />
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    Interface Preference
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium">
                    Select your preferred visual environment.
                  </p>
                </div>
              </div>

              <div className="grid w-full grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex h-16 sm:h-24 w-full flex-row sm:flex-col items-center justify-center gap-3 rounded-2xl border transition-all duration-200 ${
                    theme === "light"
                      ? "border-foreground bg-foreground text-background shadow-lg scale-[1.02]"
                      : "border-border/40 bg-card/30 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-border/80"
                  }`}
                >
                  <Sun className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="font-semibold text-sm">Light</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex h-16 sm:h-24 w-full flex-row sm:flex-col items-center justify-center gap-3 rounded-2xl border transition-all duration-200 ${
                    theme === "dark"
                      ? "border-foreground bg-foreground text-background shadow-lg scale-[1.02]"
                      : "border-border/40 bg-card/30 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-border/80"
                  }`}
                >
                  <Moon className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="font-semibold text-sm">Dark</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex h-16 sm:h-24 w-full flex-row sm:flex-col items-center justify-center gap-3 rounded-2xl border transition-all duration-200 ${
                    theme === "system"
                      ? "border-foreground bg-foreground text-background shadow-lg scale-[1.02]"
                      : "border-border/40 bg-card/30 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-border/80"
                  }`}
                >
                  <Monitor className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="font-semibold text-sm">System</span>
                </button>
              </div>

              <Button
                className="mt-2 w-full rounded-xl py-6 text-lg font-semibold shadow-lg shadow-[#0038A8]/20 transition-all hover:scale-[1.02] bg-[#0038A8] text-white hover:bg-[#002776]"
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="flex w-full flex-col items-center gap-6">
              <div className="flex flex-col items-center justify-center gap-6 mb-2">
                <Image
                  src="/climaph-brand-logo.webp"
                  alt="ClimaPH Brand Logo"
                  width={140}
                  height={32}
                  className="object-contain"
                  priority
                />
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    Establish Node
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium">
                    Provide location access or enter a target node manually.
                  </p>
                </div>
              </div>

              <Button
                className="w-full rounded-2xl py-6 sm:py-8 text-base sm:text-lg font-semibold shadow-lg shadow-[#0038A8]/20 transition-all hover:scale-[1.02] bg-[#0038A8] text-white hover:bg-[#002776]"
                onClick={handleGeolocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    >
                      <LocateFixed className="h-5 w-5" />
                    </motion.div>
                    Calibrating Array...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Acquire Current Coordinate
                  </span>
                )}
              </Button>

              <div className="flex w-full items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-border/60"></div>
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                  Or Input Manually
                </span>
                <div className="h-[1px] flex-1 bg-border/60"></div>
              </div>

              <div className="relative w-full text-left">
                <div className="h-12 sm:h-14 bg-card border border-border/60 shadow-inner rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-[#0038A8]/30">
                  <SearchBar
                    input={input}
                    onChange={(e) => onChange(e.target.value)}
                    getWeather={() => {}}
                    loadingWeather={false}
                    hasValidSelection={false}
                  />
                </div>
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.99 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-[calc(100%+8px)] shadow-2xl z-[9999]"
                    >
                      <div className="overflow-hidden rounded-xl border border-border/40 bg-card/95 backdrop-blur-xl">
                        <Suggestions
                          suggestions={suggestions}
                          pickSuggestion={handleSuggestionSelection}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}