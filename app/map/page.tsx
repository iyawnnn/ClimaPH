"use client";

import dynamic from "next/dynamic";
import { useAppStore } from "@/store/useAppStore";
import MapControls from "@/components/map/MapControls";
import MapLegend from "@/components/MapLegend";

const WeatherMap = dynamic(
  () => import("@/components/weather/WeatherMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-background/50 animate-pulse">
        <span className="font-sans text-xs font-bold tracking-widest uppercase text-muted-foreground">
          Establishing Satellite Uplink...
        </span>
      </div>
    )
  }
);

export default function MapPage() {
  const { mapLayer } = useAppStore();

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      
      {/* Full Bleed Map Layer */}
      <div className="absolute inset-0 z-0">
        <WeatherMap />
      </div>

      {/* Floating HUD - Top Left */}
      <div className="absolute top-6 left-6 z-[400] pointer-events-auto">
        <MapControls />
      </div>

      {/* Floating Legend - Bottom Right */}
      <div className="absolute bottom-6 right-6 z-[400] pointer-events-auto bg-background/80 backdrop-blur-xl border border-border/20 rounded-xl overflow-hidden shadow-2xl">
        <MapLegend layer={mapLayer as any} />
      </div>

    </div>
  );
}