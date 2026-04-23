"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Layers, Wind, Cloud, Droplets, Thermometer, MapPin, Activity, LocateFixed } from "lucide-react";
import { toast } from "sonner";

const weatherLayers = [
  { id: "precipitation_new", label: "Precipitation", icon: Droplets },
  { id: "temp_new", label: "Temperature", icon: Thermometer },
  { id: "wind_new", label: "Wind Speed", icon: Wind },
  { id: "clouds_new", label: "Cloud Cover", icon: Cloud },
];

export default function MapFloatingControls() {
  const { mapLayer, setMapLayer, targetLocation, setTargetLocation } = useAppStore();
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
        setTargetLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          display: "Current Location",
        } as any);
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
    <div className="absolute inset-0 z-[1000] pointer-events-none p-3 md:p-6 lg:p-8 flex flex-col justify-between" style={{ fontFamily: "var(--font-instrument-sans), sans-serif" }}>
      
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start w-full gap-3 md:gap-4">
        
        {/* Header Block with GPS Button */}
        <div className="pointer-events-auto flex flex-col gap-2 w-full md:w-auto">
          <div className="px-4 py-3 md:px-5 md:py-4 bg-background/80 backdrop-blur-xl border border-border/30 shadow-lg rounded-2xl flex justify-between items-center gap-4">
            <div>
              <h1 className="text-lg md:text-2xl font-bold tracking-tight text-white uppercase">Global Radar</h1>
              <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-[#FCD116]" />
                <span className="truncate max-w-[200px] md:max-w-md text-white/90">
                  {targetLocation?.display || "San Fernando, Pampanga, Philippines"}
                </span>
              </p>
            </div>

            {/* Target Location GPS Action */}
            <button
              onClick={handleCurrentLocation}
              disabled={isLocating}
              className="p-3 rounded-full bg-[#0038A8] text-white hover:bg-[#002776] transition-all shadow-md flex-shrink-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0038A8]"
              aria-label="Use Current Location"
            >
              <LocateFixed className={`w-4 h-4 md:w-5 md:h-5 ${isLocating ? "animate-spin text-[#FCD116]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Telemetry Block (Hidden on Mobile) */}
        <div className="pointer-events-auto hidden md:flex flex-col gap-3 w-72">
          <div className="p-4 bg-background/80 backdrop-blur-xl border border-border/30 shadow-lg flex flex-col gap-3 rounded-2xl">
            <div className="flex items-center gap-2 pb-2 border-b border-border/20">
              <Activity className="w-4 h-4 text-[#0038A8]" />
              <span className="text-sm font-bold tracking-tight text-white uppercase">Real-Time Telemetry</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">LAT</span>
              <span className="text-sm font-semibold text-white">{targetLocation?.lat?.toFixed(4) || "15.0286"}°</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">LON</span>
              <span className="text-sm font-semibold text-white">{(targetLocation?.lon ?? (targetLocation as any)?.lng)?.toFixed(4) || "120.6925"}°</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex justify-between items-end w-full mt-auto pt-4">
        <div className="pointer-events-auto flex items-center gap-2 p-1.5 md:p-2 bg-background/80 backdrop-blur-xl border border-border/30 shadow-lg w-full md:w-auto rounded-2xl md:rounded-3xl overflow-x-auto no-scrollbar">
          <div className="px-3 border-r border-border/20 hidden md:flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-muted-foreground" />
          </div>
          
          <div className="flex w-max md:w-auto gap-2">
            {weatherLayers.map((layer) => {
              const Icon = layer.icon;
              const isActive = mapLayer === layer.id;
              
              return (
                <button
                  key={layer.id}
                  onClick={() => setMapLayer(layer.id)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-3 transition-all duration-200 rounded-xl md:rounded-2xl shrink-0 ${
                    isActive 
                      ? "bg-[#0038A8] text-white shadow-md" 
                      : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="font-semibold text-xs md:text-sm whitespace-nowrap">{layer.label}</span>
                  {isActive && <div className="ml-1 w-1.5 h-1.5 rounded-full bg-[#FCD116]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
    </div>
  );
}