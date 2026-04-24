"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useWeather } from "@/hooks/useWeather";
import { Layers, Wind, Cloud, Droplets, Thermometer, MapPin, Activity, LocateFixed } from "lucide-react";
import { toast } from "sonner";

const weatherLayers = [
  { id: "precipitation_new", label: "Precipitation", icon: Droplets },
  { id: "temp_new", label: "Temperature", icon: Thermometer },
  { id: "wind_new", label: "Wind Speed", icon: Wind },
  { id: "clouds_new", label: "Cloud Cover", icon: Cloud },
];

export default function MapFloatingControls() {
  const { mapLayer, setMapLayer, targetLocation } = useAppStore();
  const { getWeather } = useWeather();
  const [isLocating, setIsLocating] = useState(false);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation services are unavailable.");
      return;
    }
    
    setIsLocating(true);
    toast.info("Acquiring GPS lock...");
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getWeather(pos.coords.latitude, pos.coords.longitude);
        setIsLocating(false);
        toast.success("Location updated securely.");
      },
      () => {
        setIsLocating(false);
        toast.error("Failed to retrieve coordinates.");
      }
    );
  };

  return (
    <div className="absolute inset-0 z-[1000] pointer-events-none p-3 md:p-6 flex flex-col justify-between" style={{ fontFamily: "var(--font-sans), sans-serif" }}>
      
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start w-full gap-2 md:gap-4">
        
        {/* Header Block with GPS Button */}
        <div className="pointer-events-auto flex flex-col gap-2 w-full md:w-auto max-w-full">
          <div className="px-3 py-2.5 md:px-5 md:py-4 bg-white dark:bg-slate-900 shadow-xl rounded-2xl md:rounded-[1.5rem] flex justify-between items-center gap-3 md:gap-4 border border-border/20">
            <div className="min-w-0 flex-1">
              <h1 className="text-base md:text-2xl font-bold tracking-tight text-foreground whitespace-nowrap">Global Radar</h1>
              <p className="text-[11px] md:text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-secondary shrink-0" />
                <span className="truncate text-foreground/90 font-medium">
                  {targetLocation?.display || "San Fernando, Pampanga, Philippines"}
                </span>
              </p>
            </div>

            <button
              onClick={handleCurrentLocation}
              disabled={isLocating}
              className="p-2.5 md:p-3 rounded-xl md:rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-md flex-shrink-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <LocateFixed className={`w-4 h-4 md:w-5 md:h-5 ${isLocating ? "animate-spin text-secondary" : ""}`} />
            </button>
          </div>
        </div>

        {/* Telemetry Block (Hidden on Mobile) */}
        <div className="pointer-events-auto hidden md:flex flex-col gap-3 w-64 lg:w-72">
          <div className="p-4 bg-white dark:bg-slate-900 shadow-xl flex flex-col gap-3 rounded-[1.5rem] border border-border/20">
            <div className="flex items-center gap-2 pb-2 border-b border-border/10">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold tracking-tight text-foreground">Real-Time Telemetry</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">LAT</span>
              <span className="text-sm font-semibold text-foreground">{targetLocation?.lat?.toFixed(4) || "15.0286"}°</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">LON</span>
              <span className="text-sm font-semibold text-foreground">{(targetLocation?.lon ?? (targetLocation as any)?.lng)?.toFixed(4) || "120.6925"}°</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Layer Controls */}
      <div className="flex justify-center md:justify-start items-end w-full mt-auto pt-2 md:pt-4">
        <div className="pointer-events-auto flex items-center gap-1 md:gap-2 p-1.5 md:p-2 bg-white dark:bg-slate-900 shadow-2xl w-full md:w-auto rounded-2xl md:rounded-[1.5rem] overflow-x-auto scrollbar-hide border border-border/20">
          <div className="px-2 md:px-3 border-r border-border/10 hidden md:flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          </div>
          
          <div className="flex w-max md:w-auto gap-1 md:gap-2">
            {weatherLayers.map((layer) => {
              const Icon = layer.icon;
              const isActive = mapLayer === layer.id;
              
              return (
                <button
                  key={layer.id}
                  onClick={() => setMapLayer(layer.id)}
                  className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2.5 transition-all duration-200 rounded-xl md:rounded-2xl shrink-0 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                  <span className="font-semibold text-[11px] md:text-sm whitespace-nowrap">{layer.label}</span>
                  {isActive && <div className="ml-1 w-1.5 h-1.5 rounded-full bg-secondary" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
    </div>
  );
}