"use client";

import { useWeather } from "@/hooks/useWeather";
import { useAppStore } from "@/store/useAppStore";
import { Cloud, CloudRain, Sun, CloudLightning } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const getWeatherIcon = (desc?: string) => {
  const safeDesc = (desc || "").toLowerCase();
  if (safeDesc.includes("rain")) return <CloudRain className="h-16 w-16 text-primary/70" />;
  if (safeDesc.includes("cloud")) return <Cloud className="h-16 w-16 text-muted-foreground" />;
  if (safeDesc.includes("thunder")) return <CloudLightning className="h-16 w-16 text-primary/70" />;
  return <Sun className="h-16 w-16 text-primary/70" />;
};

export default function CurrentWeather() {
  const { weather, loadingWeather } = useWeather();
  const { targetLocation, unit } = useAppStore();

  if (loadingWeather || !weather) {
    return <Skeleton className="w-full h-full min-h-[320px] rounded-3xl bg-muted/30 border border-border/30" />;
  }

  // Safely extract OWM standard response properties
  const current = weather.current || weather;
  const main = current?.main || current;
  const weatherDetails = current?.weather?.[0] || {};

  const temp = main?.temp ?? current?.temp_c ?? 0;
  const displayTemp = unit === "C" ? Math.round(temp) : Math.round((temp * 9) / 5 + 32);
  
  const high = main?.temp_max ?? current?.high ?? 0;
  const low = main?.temp_min ?? current?.low ?? 0;
  const displayHigh = unit === "C" ? Math.round(high) : Math.round((high * 9) / 5 + 32);
  const displayLow = unit === "C" ? Math.round(low) : Math.round((low * 9) / 5 + 32);

  const description = weatherDetails?.description || current?.condition?.text || "Clear";

  return (
    <div className="flex flex-col justify-between h-full z-10">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-sans">
            {targetLocation?.display || "Unknown Location"}
          </h2>
          <p className="text-muted-foreground capitalize font-sans mt-1">{description}</p>
        </div>
        {getWeatherIcon(description)}
      </div>
      
      <div className="mt-auto pt-8">
        <div className="text-7xl font-bold tracking-tighter text-foreground font-sans">
          {displayTemp}°{unit}
        </div>
        <div className="flex gap-4 mt-4">
          <span className="text-sm font-medium text-foreground">H: {displayHigh}°</span>
          <span className="text-sm font-medium text-muted-foreground">L: {displayLow}°</span>
        </div>
      </div>
    </div>
  );
}