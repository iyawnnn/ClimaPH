"use client";

import { useAppStore } from "@/store/useAppStore";
import { Layers, Navigation, Bookmark, Droplets, Thermometer, Wind, Cloud } from "lucide-react";
import type { Suggestion } from "@/types/types";

const weatherLayers = [
  { id: "precipitation_new", label: "Precipitation", icon: Droplets },
  { id: "temp_new", label: "Temperature", icon: Thermometer },
  { id: "wind_new", label: "Wind Speed", icon: Wind },
  { id: "clouds_new", label: "Cloud Cover", icon: Cloud },
];

export default function MapSidebar() {
  const { mapLayer, setMapLayer, targetLocation, favorites, setTargetLocation } = useAppStore();

  const handleLocationSelect = (location: Suggestion) => {
    setTargetLocation(location);
  };

  return (
    <aside className="w-full xl:w-[340px] 2xl:w-[440px] shrink-0 bg-muted/40 border-t xl:border-t-0 xl:border-l border-border/30 p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col gap-6 lg:gap-8 min-h-full overflow-y-auto">
      <section className="w-full flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-foreground" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground" style={{ fontFamily: "var(--font-instrument-sans), sans-serif" }}>
            Map Layers
          </h2>
        </div>
        
        <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
          {weatherLayers.map((layer) => {
            const Icon = layer.icon;
            const isActive = mapLayer === layer.id;
            
            return (
              <button
                key={layer.id}
                onClick={() => setMapLayer(layer.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  isActive 
                    ? "bg-primary/10 border-primary/30 text-primary shadow-sm" 
                    : "bg-card border-border/40 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                aria-pressed={isActive}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{layer.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="w-full flex flex-col gap-4 mt-2">
        <div className="flex items-center gap-2 mb-2">
          <Bookmark className="w-5 h-5 text-foreground" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground" style={{ fontFamily: "var(--font-instrument-sans), sans-serif" }}>
            Saved Locations
          </h2>
        </div>
        
        <div className="flex flex-col gap-2">
          {favorites.length === 0 ? (
            <div className="p-4 rounded-xl border border-border/40 border-dashed text-center text-sm text-muted-foreground">
              No saved locations found.
            </div>
          ) : (
            favorites.map((fav, index) => (
              <button
                key={`${fav.display}-${index}`}
                onClick={() => handleLocationSelect(fav)}
                className="flex flex-col items-start p-3 rounded-xl border border-border/40 bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <span className="font-medium text-sm text-foreground truncate w-full">
                  {fav.display}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {fav.lat.toFixed(4)}, {(fav.lon ?? (fav as any).lng).toFixed(4)}
                </span>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="w-full flex flex-col gap-4 mt-auto pt-4">
        <div className="flex items-center gap-2 mb-2">
          <Navigation className="w-5 h-5 text-foreground" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground" style={{ fontFamily: "var(--font-instrument-sans), sans-serif" }}>
            Telemetry Data
          </h2>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/40 flex flex-col gap-3 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-border/20">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Latitude</span>
            <span className="text-sm font-medium text-foreground">{targetLocation?.lat?.toFixed(4) || "15.0286"}°</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Longitude</span>
            <span className="text-sm font-medium text-foreground">{(targetLocation?.lon ?? (targetLocation as any)?.lng)?.toFixed(4) || "120.6925"}°</span>
          </div>
        </div>
      </section>
    </aside>
  );
}