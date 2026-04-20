"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useSearch } from "@/hooks/useSearch";
import { useWeather } from "@/hooks/useWeather";
import SearchBar from "@/components/search/SearchBar";
import Suggestions from "@/components/search/Suggestions";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getFavorites } from "@/lib/favorites";
import { Activity, Locate, Star } from "lucide-react";
import type { Suggestion } from "@/types/types";

export default function SiteHeader() {
  const { isCrisisMode, toggleCrisisMode, setTargetLocation, targetLocation } =
    useAppStore();
  const [isLocating, setIsLocating] = useState(false);
  const [favorites, setFavorites] = useState<Suggestion[]>([]);

  // Load favorites on mount to prevent hydration mismatch
  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const { input, suggestions, onChange, pickSuggestion, setSuggestions } =
    useSearch();

  const { getWeather, loadingWeather } = useWeather();

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      toast.info("Locating you...");

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          // The updated getWeather hook handles reverse geocoding and updates the store
          getWeather(latitude, longitude);
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          toast.error("Unable to get current location.");
        },
      );
    } else {
      toast.error("Geolocation is not supported.");
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    pickSuggestion(suggestion);
    setSuggestions([]);
    setTargetLocation(suggestion); // Directly update Zustand store
  };

  const isLoading = loadingWeather || isLocating;

  const headerClass = isCrisisMode
    ? "bg-background border-b"
    : "bg-background/95 md:bg-card/70 md:rounded-xl md:border shadow-sm backdrop-blur-md";

  return (
    <header
      className={`sticky top-0 md:top-4 z-50 p-4 transition-all ${headerClass}`}
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Block 1: Logo & Mobile Actions */}
        <div className="flex w-full md:w-auto items-center justify-between">
          <h1
            className="text-2xl font-bold tracking-tight cursor-pointer"
            onClick={() => window.location.reload()}
          >
            {isCrisisMode ? (
              "CLIMAPH[SYS]"
            ) : (
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ClimaPH
              </span>
            )}
          </h1>

          <div className="flex items-center gap-1 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCrisisMode}
              className={`h-9 w-9 ${isCrisisMode ? "text-red-500" : ""}`}
            >
              <Activity className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCurrentLocation}
              className="h-9 w-9"
            >
              <Locate className="h-5 w-5" />
            </Button>
            <ModeToggle />
          </div>
        </div>

        {/* Block 2: Search Bar */}
        <div className="relative w-full md:max-w-md lg:max-w-lg">
          <SearchBar
            input={input}
            onChange={(e) => onChange(e.target.value)}
            getWeather={() => getWeather(undefined, undefined, input)}
            loadingWeather={isLoading}
            hasValidSelection={!!targetLocation}
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

        {/* Block 3: Desktop Actions */}
        <div className="hidden md:flex items-center gap-1">
          <Button
            variant={isCrisisMode ? "destructive" : "outline"}
            size="sm"
            onClick={toggleCrisisMode}
            className="mr-2"
          >
            <Activity className="h-4 w-4 mr-2" />
            Crisis Mode
          </Button>

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
                      onClick={() => setTargetLocation(fav)}
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
  );
}
