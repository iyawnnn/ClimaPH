"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAppStore } from "@/store/useAppStore";
import { useWeather } from "@/hooks/useWeather";
import {
  LayoutGrid,
  Compass,
  Pin,
  Sun,
  Moon,
  ShieldAlert,
  Star,
  LocateFixed,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { getFavorites } from "@/lib/favorites";
import type { Suggestion } from "@/types/types";

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { isCrisisMode, toggleCrisisMode, setTargetLocation } = useAppStore();
  const { getWeather } = useWeather();
  const [favorites, setFavorites] = useState<Suggestion[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleGeolocationUpdate = () => {
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
        toast.success("Node recalibrated to current coordinates.");
      },
      () => {
        setIsLocating(false);
        toast.error("Coordinate retrieval failed.");
      }
    );
  };

  return (
    <aside className="hidden lg:flex w-24 h-full flex-col items-center py-8 shrink-0 z-50 bg-background/50 border-r border-border/40">
      <div className="w-full flex justify-center mb-10 shrink-0">
        <Link
          href="/"
          className="relative w-14 h-14 flex items-center justify-center transition-transform hover:scale-105"
        >
          <Image
            src="/climaph-brand-logo.webp"
            alt="ClimaPH Brand Logo"
            fill
            sizes="(max-width: 768px) 40px, 56px" 
            className="object-contain" 
            priority
          />
        </Link>
      </div>

      <nav className="flex flex-col gap-4 w-full items-center shrink-0">
        <NavIcon
          href="/"
          icon={LayoutGrid}
          label="Dashboard"
          active={pathname === "/"}
        />
        <NavIcon
          href="/map"
          icon={Compass}
          label="Global Radar"
          active={pathname === "/map"}
        />

        <Dialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-block">
                <DialogTrigger asChild>
                  <button className="w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground outline-none">
                    <Pin className="w-5 h-5 stroke-[1.5]" />
                    <span className="sr-only">Anchored Nodes</span>
                  </button>
                </DialogTrigger>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={16}
              className="bg-foreground text-background border-none font-sans font-semibold tracking-wide shadow-xl"
            >
              Anchored Nodes
            </TooltipContent>
          </Tooltip>

          <DialogContent className="max-w-xs overflow-hidden rounded-2xl border-border/20 bg-background/95 p-0 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-border/10 bg-muted/30 px-5 py-4">
              <DialogTitle className="text-xs font-bold uppercase tracking-widest text-foreground">
                Anchored Nodes
              </DialogTitle>
            </div>
            <div className="flex max-h-[300px] flex-col overflow-y-auto p-3 scrollbar-hide">
              {favorites.length === 0 ? (
                <div className="my-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 bg-muted/10 py-8">
                  <Pin className="mb-2 h-6 w-6 text-muted-foreground/40" />
                  <p className="text-xs font-medium text-muted-foreground">
                    No coordinates saved.
                  </p>
                </div>
              ) : (
                favorites.map((fav) => (
                  <DialogTrigger asChild key={fav.display}>
                    <button
                      className="mb-1 flex h-12 w-full items-center justify-start rounded-xl px-4 text-sm font-medium transition-colors hover:bg-muted/50 text-foreground"
                      onClick={() => setTargetLocation(fav)}
                    >
                      <Star className="mr-3 h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{fav.display}</span>
                    </button>
                  </DialogTrigger>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </nav>

      <div className="mt-auto flex flex-col gap-4 w-full items-center shrink-0 pt-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleGeolocationUpdate}
              disabled={isLocating}
              className="w-14 h-14 flex items-center justify-center rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 outline-none disabled:opacity-50"
            >
              <LocateFixed className={`w-5 h-5 stroke-[1.5] ${isLocating ? "animate-pulse text-primary" : ""}`} />
              <span className="sr-only">Sync GPS Coordinates</span>
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={16}
            className="bg-foreground text-background border-none font-sans font-semibold tracking-wide shadow-xl"
          >
            Sync Node Coordinates
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleCrisisMode}
              className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 border outline-none ${
                isCrisisMode
                  ? "bg-[#CE1126] text-white border-[#CE1126] animate-pulse shadow-[0_0_15px_rgba(206,17,38,0.5)]"
                  : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <ShieldAlert className="w-5 h-5 stroke-[1.5]" />
              <span className="sr-only">Toggle Crisis Mode</span>
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={16}
            className="bg-foreground text-background border-none font-sans font-semibold tracking-wide shadow-xl"
          >
            {isCrisisMode
              ? "Disable Crisis Protocol"
              : "Enable Crisis Protocol"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-14 h-14 flex items-center justify-center rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 outline-none"
            >
              <Sun className="w-5 h-5 stroke-[1.5] hidden dark:block" />
              <Moon className="w-5 h-5 stroke-[1.5] block dark:hidden" />
              <span className="sr-only">Toggle Theme</span>
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={16}
            className="bg-foreground text-background border-none font-sans font-semibold tracking-wide shadow-xl"
          >
            Toggle Interface Theme
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}

function NavIcon({
  href,
  icon: Icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-200 outline-none ${
            active
              ? "bg-[#0038A8] text-white shadow-md shadow-[#0038A8]/30"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Icon className="w-5 h-5 stroke-[1.5]" />
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={16}
        className="bg-foreground text-background border-none font-sans font-semibold tracking-wide shadow-xl"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}