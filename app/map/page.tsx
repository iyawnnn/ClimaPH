"use client";

import dynamic from "next/dynamic";
import { useAppStore } from "@/store/useAppStore";
import { Layers } from "lucide-react";

const WeatherMap = dynamic(
  () => import("@/components/weather/WeatherMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-card border border-border/20 rounded-3xl animate-pulse">
        <span className="text-sm text-muted-foreground font-sans tracking-widest uppercase">Initializing Global Telemetry...</span>
      </div>
    )
  }
);

export default function MapPage() {
  const { targetLocation } = useAppStore();

  return (
    <div className="flex flex-col w-full h-full gap-6 pb-6">
      
      <header className="w-full flex items-center justify-between pb-4 border-b border-border/20 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-sans">
            Global Radar
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">
            Real-time environmental overlays for <span className="text-foreground font-medium">{targetLocation?.display || "your region"}</span>
          </p>
        </div>
        
        {/* You can optionally add a layer toggler here later */}
        <button className="p-3 rounded-2xl bg-muted/20 border border-border/30 text-muted-foreground hover:text-foreground transition-all">
          <Layers className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 w-full rounded-3xl bg-muted/10 border border-border/10 p-2 overflow-hidden relative">
        <WeatherMap />
      </div>
    </div>
  );
}