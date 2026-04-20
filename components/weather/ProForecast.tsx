"use client";

import { useWeather } from "@/hooks/useWeather";
import { useAppStore } from "@/store/useAppStore";
import { Cloud, CloudRain, Sun, CloudLightning } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const getWeatherIcon = (desc?: string) => {
  const safeDesc = (desc || "").toLowerCase();
  if (safeDesc.includes("rain")) return <CloudRain className="h-5 w-5 text-primary/70" />;
  if (safeDesc.includes("cloud")) return <Cloud className="h-5 w-5 text-muted-foreground" />;
  if (safeDesc.includes("thunder")) return <CloudLightning className="h-5 w-5 text-primary/70" />;
  return <Sun className="h-5 w-5 text-primary/70" />;
};

export default function ProForecast() {
  const { fiveDayForecast, loadingWeather } = useWeather();
  const { unit } = useAppStore();

  if (loadingWeather || !fiveDayForecast) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl bg-muted/30 border border-border/30" />
        ))}
      </div>
    );
  }

  // Group the 3-hour blocks into daily summaries
  const dailyMap = new Map();
  fiveDayForecast.forEach((item: any) => {
    const date = new Date(item.dt * 1000);
    const dateString = date.toLocaleDateString();
    
    if (!dailyMap.has(dateString)) {
      dailyMap.set(dateString, { 
        dt: item.dt,
        min: item.main.temp_min, 
        max: item.main.temp_max,
        description: item.weather?.[0]?.description || "Clear"
      });
    } else {
      const existing = dailyMap.get(dateString);
      existing.min = Math.min(existing.min, item.main.temp_min);
      existing.max = Math.max(existing.max, item.main.temp_max);
    }
  });

  // Convert the map back to an array (OWM free tier gives 5 days)
  const dailyData = Array.from(dailyMap.values());

  if (dailyData.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        Forecast data unavailable for this region.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {dailyData.map((day: any, index: number) => {
        const dateObj = new Date(day.dt * 1000);
        const dayName = index === 0 ? "Today" : dateObj.toLocaleDateString("en-US", { weekday: "long" });
        
        const displayHigh = unit === "C" ? Math.round(day.max) : Math.round((day.max * 9) / 5 + 32);
        const displayLow = unit === "C" ? Math.round(day.min) : Math.round((day.min * 9) / 5 + 32);

        return (
          <div 
            key={index} 
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/30 transition-colors"
          >
            <span className="w-24 text-sm font-medium text-foreground">{dayName}</span>
            <div className="flex flex-1 items-center justify-center gap-2">
              {getWeatherIcon(day.description)}
              <span className="text-xs text-muted-foreground hidden sm:block w-20 truncate text-center capitalize">
                {day.description}
              </span>
            </div>
            <div className="flex gap-3 w-20 justify-end">
              <span className="text-sm font-bold text-foreground">{displayHigh}°</span>
              <span className="text-sm font-medium text-muted-foreground">{displayLow}°</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}