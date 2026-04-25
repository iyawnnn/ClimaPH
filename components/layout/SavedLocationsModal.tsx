"use client";

import { useAppStore } from "@/store/useAppStore";
import { MapPin, Navigation, Pin, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SavedLocationsModal() {
  const { setTargetLocation, favorites, toggleFavorite } = useAppStore();

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">
            <DialogTrigger asChild>
              <button className="w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground outline-none">
                <Pin className="w-5 h-5 stroke-[1.5]" />
                <span className="sr-only">Saved Locations</span>
              </button>
            </DialogTrigger>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={16} className="bg-foreground text-background border-none font-sans font-semibold tracking-wide shadow-xl">
          Saved Locations
        </TooltipContent>
      </Tooltip>

      <DialogContent className="max-w-md overflow-hidden rounded-[24px] border border-border/20 bg-background/60 p-0 shadow-2xl backdrop-blur-3xl font-sans sm:max-w-md">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border/10 bg-muted/20 pr-12">
          <MapPin className="h-5 w-5 text-[#0038A8]" strokeWidth={1.5} />
          <DialogTitle className="text-base font-semibold tracking-wide text-foreground">
            Saved Locations
          </DialogTitle>
        </div>
        
        <div className="flex max-h-[400px] flex-col overflow-y-auto px-3 pb-3 pt-2 scrollbar-hide gap-1.5">
          {favorites.length === 0 ? (
            <div className="my-8 flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed border-border/20 bg-muted/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/20 mb-4 shadow-inner">
                <Navigation className="h-5 w-5 text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-muted-foreground/60 tracking-wide">
                No locations saved.
              </p>
            </div>
          ) : (
            favorites.map((fav) => (
              <div 
                key={fav.display} 
                className="group relative flex items-center justify-between rounded-xl p-2 transition-all duration-300 hover:bg-muted/50 border border-transparent hover:border-border/10"
              >
                <DialogTrigger asChild>
                  {/* Added min-w-0 to allow the container to shrink and enforce truncation */}
                  <button
                    className="flex flex-1 min-w-0 items-center gap-3 text-sm font-medium text-foreground/80 transition-colors group-hover:text-foreground outline-none text-left rounded-lg px-2 py-1.5 focus-visible:ring-2 focus-visible:ring-[#0038A8]/30"
                    onClick={() => setTargetLocation(fav)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40 transition-colors group-hover:bg-[#0038A8]/10 shrink-0">
                      <Navigation className="h-4 w-4 text-muted-foreground/60 group-hover:text-[#0038A8] transition-colors" strokeWidth={1.5} />
                    </div>
                    <span className="truncate pr-4">{fav.display}</span>
                  </button>
                </DialogTrigger>
                
                <button 
                  onClick={() => toggleFavorite(fav)}
                  className="p-2 mr-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#CE1126]/10 outline-none text-muted-foreground hover:text-[#CE1126] focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#CE1126]/50 shrink-0"
                  aria-label="Remove saved location"
                  title="Remove saved location"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}