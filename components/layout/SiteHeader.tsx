"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useSearch } from "@/hooks/useSearch";
import { useWeather } from "@/hooks/useWeather";
import SearchBar from "@/components/search/SearchBar";
import Suggestions from "@/components/search/Suggestions";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { toast } from "sonner";
import {
  LocateFixed,
  Star,
  X,
  LayoutGrid,
  Compass,
} from "lucide-react";
import type { Suggestion } from "@/types/types";

export default function SiteHeader() {
  const { setTargetLocation, targetLocation, favorites } = useAppStore();
  const [isLocating, setIsLocating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
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
      <header className="sticky top-0 z-40 w-full border-b border-border/10 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shrink-0 lg:hidden">
        <div className="flex h-16 w-full items-center justify-between gap-4 px-4 md:px-6">
          <div
            className="flex shrink-0 cursor-pointer items-center transition-transform hover:scale-105"
            onClick={() => window.location.reload()}
          >
            <Image
              src="/climaph-brand-logo.webp"
              alt="ClimaPH Main Navigation Logo"
              width={150}
              height={36}
              className="h-8 w-auto object-contain md:h-9"
              priority
            />
          </div>

          <div className="relative flex flex-1 items-center justify-center max-w-2xl">
            <div className="h-10 w-full rounded-xl border border-border/20 bg-background/50 backdrop-blur-md focus-within:border-primary/50 focus-within:bg-background transition-all">
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
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-[calc(100%+8px)] shadow-2xl"
                >
                  <div className="overflow-hidden rounded-2xl border border-border/10 bg-background/95 ring-1 ring-border/5 backdrop-blur-2xl">
                    <Suggestions
                      suggestions={suggestions}
                      pickSuggestion={handleSuggestionClick}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCurrentLocation}
              className="h-10 w-10 rounded-xl text-foreground/70 transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <LocateFixed className="h-[20px] w-[20px]" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:ring-0"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="16" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex flex-col bg-background px-6 py-6 lg:hidden"
          >
            <div className="mb-8 flex items-center justify-between">
              <Image
                src="/climaph-brand-logo.webp"
                alt="ClimaPH Mobile Menu Logo"
                width={160}
                height={40}
                className="h-9 w-auto object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                className="h-10 w-10 rounded-full bg-muted/50 transition-colors hover:bg-foreground hover:text-background"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 rounded-xl px-4 py-4 text-lg font-semibold text-foreground/80 transition-all hover:bg-muted/40 hover:text-foreground font-sans"
              >
                <LayoutGrid className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/map"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 rounded-xl px-4 py-4 text-lg font-semibold text-foreground/80 transition-all hover:bg-muted/40 hover:text-foreground font-sans"
              >
                <Compass className="h-5 w-5" />
                Global Radar
              </Link>

              <div className="my-4 h-px w-full bg-border/20" />

              <div className="flex flex-col gap-1 px-4">
                <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground font-sans">
                  Saved Locations
                </span>
                {favorites.length === 0 ? (
                  <p className="text-sm font-medium text-muted-foreground/60 py-2">
                    No locations saved.
                  </p>
                ) : (
                  favorites.map((fav) => (
                    <button
                      key={fav.display}
                      className="flex w-full items-center gap-3 rounded-xl py-3 px-2 text-left text-base font-medium text-foreground/80 transition-colors hover:bg-muted/30 hover:text-foreground outline-none font-sans"
                      onClick={() => handleSuggestionClick(fav)}
                    >
                      <Star className="h-4 w-4 fill-[#FCD116] text-[#FCD116]" strokeWidth={0} />
                      <span className="truncate">{fav.display}</span>
                    </button>
                  ))
                )}
              </div>
            </nav>

            <div className="mt-auto pt-8">
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-border/10 bg-muted/20 px-5 py-4">
                <span className="text-sm font-semibold tracking-tight text-foreground/80 font-sans">
                  Interface Theme
                </span>
                <ModeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}