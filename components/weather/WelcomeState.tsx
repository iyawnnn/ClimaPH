"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useAppStore } from "@/store/useAppStore";
import { useWeather } from "@/hooks/useWeather";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LocateFixed, Moon, Sun, Monitor, MapPin } from "lucide-react";

export default function WelcomeState() {
  const { setTheme, theme } = useTheme();
  const { setTargetLocation, completeOnboarding } = useAppStore();
  const { getWeather, weatherData } = useWeather();
  const [step, setStep] = useState(1);
  const [isLocating, setIsLocating] = useState(false);

  // Auto-advance once weather data is successfully fetched
  useEffect(() => {
    if (weatherData && step === 2) {
      setTargetLocation({
        display: weatherData.name,
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon,
      });
      completeOnboarding();
    }
  }, [weatherData, step, setTargetLocation, completeOnboarding]);

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation services are unavailable.");
      return;
    }
    
    setIsLocating(true);
    toast.info("Acquiring satellite lock...");
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // This will trigger the useWeather hook to fetch data, 
        // which then triggers the useEffect above to complete onboarding
        getWeather(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setIsLocating(false);
        toast.error("Coordinate retrieval failed. Please allow location access.");
      }
    );
  };

  const handleManualSkip = () => {
    // Default fallback if they refuse location tracking
    setTargetLocation({
      display: "San Fernando, Pampanga",
      lat: 15.0286,
      lon: 120.6925,
    });
    completeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex w-full max-w-md flex-col items-center gap-8 px-6 text-center"
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Interface Preference</h1>
              <p className="text-muted-foreground">Select your preferred visual environment.</p>
            </div>

            <div className="grid w-full grid-cols-3 gap-4">
              <Button
                variant={theme === "light" ? "default" : "secondary"}
                className="flex h-24 flex-col gap-3 rounded-2xl border-0"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-6 w-6" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "secondary"}
                className="flex h-24 flex-col gap-3 rounded-2xl border-0"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-6 w-6" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "secondary"}
                className="flex h-24 flex-col gap-3 rounded-2xl border-0"
                onClick={() => setTheme("system")}
              >
                <Monitor className="h-6 w-6" />
                System
              </Button>
            </div>

            <Button 
              className="mt-4 w-full rounded-xl py-6 text-lg font-semibold" 
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex w-full max-w-md flex-col items-center gap-8 px-6 text-center"
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Establish Node</h1>
              <p className="text-muted-foreground">Grant access to determine your local atmospheric conditions.</p>
            </div>

            <Button
              className="w-full rounded-2xl py-8 text-lg font-semibold shadow-lg transition-all hover:scale-[1.02]"
              onClick={handleGeolocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <LocateFixed className="h-5 w-5" />
                  </motion.div>
                  Calibrating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Use Current Location
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleManualSkip}
            >
              Skip and use default coordinates
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}