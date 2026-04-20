"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getFavorites } from "@/lib/favorites";
import { Activity, LocateFixed, Star, X, MapPin } from "lucide-react";
import type { Suggestion } from "@/types/types";

export default function SiteHeader() {
  const { isCrisisMode, toggleCrisisMode, setTargetLocation, targetLocation } = useAppStore();
  const [isLocating, setIsLocating] = useState(false);
  const [favorites, setFavorites] = useState<Suggestion[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const { input, suggestions, onChange, pickSuggestion, setSuggestions } = useSearch();
  const { getWeather, loadingWeather } = useWeather();

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation services are unavailable.");
      return;
    }
    setIsLocating(true);
    toast.info("Acquiring satellite lock...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getWeather(pos.coords.latitude, pos.coords.longitude);
        setIsLocating(false);
        setIsMenuOpen(false);
      },
      () => {
        setIsLocating(false);
        toast.error("Coordinate retrieval failed.");
      },
    );
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    pickSuggestion(suggestion);
    setSuggestions([]);
    setTargetLocation(suggestion);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="flex h-16 w-full items-center justify-between px-4 md:px-6">
          
          <div className="flex flex-1 items-center justify-start gap-4">
            <div 
              className="flex cursor-pointer items-center transition-transform hover:scale-105"
              onClick={() => window.location.reload()}
            >
              <Image
                src="/climaph-brand-logo.webp"
                alt="ClimaPH Logo"
                width={150}
                height={40}
                className="h-9 w-auto object-contain md:h-10"
                priority
              />
            </div>
          </div>

          <div className="hidden flex-[2] justify-center lg:flex">
            <div className="relative w-full max-w-2xl">
              <SearchBar
                input={input}
                onChange={(e) => onChange(e.target.value)}
                getWeather={() => getWeather(undefined, undefined, input)}
                loadingWeather={loadingWeather || isLocating}
                hasValidSelection={!!targetLocation}
              />

              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-[calc(100%+12px)] shadow-2xl"
                  >
                    <div className="overflow-hidden rounded-2xl border border-primary/20 bg-background/95 ring-1 ring-primary/10 backdrop-blur-2xl">
                      <Suggestions
                        suggestions={suggestions}
                        pickSuggestion={handleSuggestionClick}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <Button
                variant={isCrisisMode ? "destructive" : "secondary"}
                size="sm"
                onClick={toggleCrisisMode}
                className={`h-10 rounded-full px-5 text-xs font-bold tracking-wide transition-all ${
                  isCrisisMode ? "animate-pulse shadow-lg shadow-destructive/20" : "hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <Activity className="mr-2 h-4 w-4" />
                {isCrisisMode ? "SYS_OVERRIDE" : "NORMAL_OP"}
              </Button>

              <div className="mx-1 h-6 w-[1px] bg-border/60" />

              <Button
                variant="ghost"
                size="icon"
                onClick={handleCurrentLocation}
                className="h-10 w-10 rounded-full text-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <LocateFixed className="h-[18px] w-[18px]" />
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-foreground/70 transition-colors hover:bg-secondary/10 hover:text-secondary">
                    <Star className="h-[18px] w-[18px]" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xs overflow-hidden rounded-3xl border-border/40 bg-background/95 p-0 shadow-2xl backdrop-blur-2xl">
                  <div className="border-b border-border/20 bg-primary/5 px-5 py-4">
                    <DialogTitle className="text-xs font-bold uppercase tracking-widest text-primary">Anchored Nodes</DialogTitle>
                  </div>
                  <div className="flex max-h-[300px] flex-col overflow-y-auto p-3 scrollbar-hide">
                    {favorites.length === 0 ? (
                      <div className="my-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/20 py-8">
                        <MapPin className="mb-2 h-6 w-6 text-muted-foreground/40" />
                        <p className="text-xs font-medium text-muted-foreground">No coordinates saved.</p>
                      </div>
                    ) : (
                      favorites.map((fav) => (
                         <DialogTrigger asChild key={fav.display}>
                          <Button
                            variant="ghost"
                            className="mb-1 h-12 w-full justify-start rounded-2xl px-4 text-sm font-semibold transition-colors hover:bg-secondary/10 hover:text-secondary"
                            onClick={() => setTargetLocation(fav)}
                          >
                            <Star className="mr-3 h-4 w-4 fill-secondary text-secondary" />
                            <span className="truncate">{fav.display}</span>
                          </Button>
                        </DialogTrigger>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <div className="mx-1 h-6 w-[1px] bg-border/60" />
              <ModeToggle />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(true)}
              className="h-10 w-10 rounded-full text-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:ring-0 lg:hidden"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="8" y1="12" x2="20" y2="12"></line>
                <line x1="12" y1="18" x2="20" y2="18"></line>
              </svg>
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] flex flex-col bg-background/95 px-6 py-8 backdrop-blur-3xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <Image
                src="/climaph-brand-logo.webp"
                alt="ClimaPH Logo"
                width={140}
                height={36}
                className="h-8 w-auto object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                className="h-10 w-10 rounded-full bg-muted/50 transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mb-6">
               <SearchBar
                input={input}
                onChange={(e) => onChange(e.target.value)}
                getWeather={() => {
                  getWeather(undefined, undefined, input);
                  setIsMenuOpen(false);
                }}
                loadingWeather={loadingWeather}
                hasValidSelection={!!targetLocation}
              />
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4 scrollbar-hide">
              <Button
                variant="secondary"
                className="h-16 w-full justify-start rounded-2xl bg-primary/10 text-base font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                onClick={handleCurrentLocation}
              >
                <LocateFixed className="mr-4 h-5 w-5" />
                Initialize GPS Lock
              </Button>

              <div className="mt-2 flex flex-col rounded-2xl border border-secondary/20 bg-secondary/5 p-2">
                <div className="flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider text-secondary">
                  <Star className="h-4 w-4 fill-secondary" />
                  Anchored Nodes
                </div>
                {favorites.length === 0 ? (
                  <div className="my-2 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-6">
                    <MapPin className="mb-2 h-5 w-5 text-muted-foreground/40" />
                    <span className="text-xs font-medium text-muted-foreground">No data available.</span>
                  </div>
                ) : (
                  favorites.map((fav) => (
                    <Button
                      key={fav.display}
                      variant="ghost"
                      className="h-14 w-full justify-start rounded-xl text-sm font-semibold transition-colors hover:bg-secondary/20"
                      onClick={() => handleSuggestionClick(fav)}
                    >
                      <MapPin className="mr-4 h-4 w-4 text-secondary" />
                      <span className="truncate">{fav.display}</span>
                    </Button>
                  ))
                )}
              </div>
            </div>

            <div className="mt-auto pt-4">
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-border/40 bg-muted/30 p-4">
                <span className="text-sm font-bold uppercase tracking-wide text-foreground/70">Interface Theme</span>
                <ModeToggle />
              </div>

              <Button
                variant={isCrisisMode ? "destructive" : "default"}
                className={`h-16 w-full justify-center rounded-2xl text-base font-bold shadow-lg transition-all ${
                  isCrisisMode ? "shadow-destructive/30" : "bg-foreground text-background shadow-foreground/20 hover:bg-primary"
                }`}
                onClick={() => {
                  toggleCrisisMode();
                  setIsMenuOpen(false);
                }}
              >
                <Activity className="mr-3 h-5 w-5" />
                {isCrisisMode ? "Disable Crisis Protocol" : "Initialize Crisis Protocol"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}