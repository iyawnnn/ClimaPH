"use client";

import { useWeather } from "@/hooks/useWeather";
import { useAppStore } from "@/store/useAppStore";
import { Cloud, CloudRain, Sun, CloudLightning } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const getWeatherIcon = (desc?: string) => {
  const safeDesc = (desc || "").toLowerCase();
  if (safeDesc.includes("rain")) return <CloudRain className="h-6 w-6 text-blue-500" />;
  if (safeDesc.includes("cloud")) return <Cloud className="h-6 w-6 text-neutral-400" />;
  if (safeDesc.includes("thunder")) return <CloudLightning className="h-6 w-6 text-purple-500" />;
  return <Sun className="h-6 w-6 text-amber-500" />;
};

export default function ProForecast() {
  const { fiveDayForecast, loadingWeather } = useWeather();
  const { unit } = useAppStore();

  if (loadingWeather || !fiveDayForecast) {
    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Changed skeleton length to 3 to match the UI behavior */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[84px] w-full rounded-2xl bg-muted/40 border border-border/40" />
        ))}
      </div>
    );
  }

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

  // Limit the generated items to exactly 3 days.
  const dailyData = Array.from(dailyMap.values()).slice(0, 3);

  if (dailyData.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        Forecast data unavailable for this region.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full font-sans">
      {dailyData.map((day: any, index: number) => {
        const dateObj = new Date(day.dt * 1000);
        const dayName = index === 0 ? "Today" : dateObj.toLocaleDateString("en-US", { weekday: "long" });
        
        const displayHigh = unit === "C" ? Math.round(day.max) : Math.round((day.max * 9) / 5 + 32);
        const displayLow = unit === "C" ? Math.round(day.min) : Math.round((day.min * 9) / 5 + 32);

        return (
          <div 
            key={index} 
            className="flex items-center justify-between p-5 rounded-2xl bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-border/60 transition-all duration-300"
          >
            <div className="flex flex-col gap-1">
              <span className="text-base font-semibold tracking-tight text-foreground">{dayName}</span>
              <span className="text-sm text-muted-foreground capitalize">{day.description}</span>
            </div>
            
            <div className="flex items-center gap-4">
              {getWeatherIcon(day.description)}
              <div className="flex items-baseline gap-3 w-16 justify-end">
                <span className="text-xl font-bold tracking-tighter text-foreground">{displayHigh}°</span>
                <span className="text-base font-medium text-muted-foreground">{displayLow}°</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}