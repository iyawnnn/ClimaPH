"use client";

import { useAppStore } from "@/store/useAppStore";
import { Thermometer, CloudRain, Wind, Cloud, Map as MapIcon, Moon, Sun, LocateFixed } from "lucide-react";

const MAP_LAYERS = [
  { id: "wind_new", label: "Wind Speed", icon: Wind },
  { id: "temp_new", label: "Temperature", icon: Thermometer },
  { id: "precipitation_new", label: "Precipitation", icon: CloudRain },
  { id: "clouds_new", label: "Cloud Cover", icon: Cloud },
];

export default function MapControls() {
  const { targetLocation, mapLayer, setMapLayer, baseMap, setBaseMap } = useAppStore();

  const handleRecalibrate = () => {
    // Triggers a subtle re-render in the map component to snap back to center
    const current = targetLocation;
    setTargetLocation(null);
    setTimeout(() => setTargetLocation(current), 50);
  };

  return (
    <div className="flex w-72 flex-col gap-6 rounded-3xl border border-border/20 bg-background/60 p-5 backdrop-blur-2xl shadow-2xl font-sans">
      
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Global Radar
        </h1>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground truncate pr-2">
            {targetLocation?.display || "Awaiting Telemetry"}
          </p>
          <button 
            onClick={handleRecalibrate}
            className="shrink-0 rounded-full bg-secondary/20 p-1.5 text-secondary-foreground hover:bg-secondary transition-colors outline-none"
            title="Recalibrate Node"
          >
            <LocateFixed className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Atmospheric Data
        </span>
        <div className="flex flex-col gap-2">
          {MAP_LAYERS.map((layer) => {
            const Icon = layer.icon;
            const isActive = mapLayer === layer.id;
            
            return (
              <button
                key={layer.id}
                onClick={() => setMapLayer(layer.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 outline-none border ${
                  isActive 
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20" 
                    : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm font-semibold tracking-tight">{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Topography Engine
        </span>
        <div className="grid grid-cols-2 gap-2 bg-muted/30 p-1 rounded-xl border border-border/10">
          <button
            onClick={() => setBaseMap("dark")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all outline-none ${
              baseMap === "dark" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="h-3.5 w-3.5" /> Dark
          </button>
          <button
            onClick={() => setBaseMap("light")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all outline-none ${
              baseMap === "light" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun className="h-3.5 w-3.5" /> Light
          </button>
        </div>
      </div>

    </div>
  );
}