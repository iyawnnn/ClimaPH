"use client";

import { useAppStore } from "@/store/useAppStore";
import { useWeather } from "@/hooks/useWeather";
import { Wind, Droplets, Sun, Eye, Thermometer, Gauge } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LifestyleGrid() {
  const { isCrisisMode, unit } = useAppStore();
  const { weather, loadingWeather } = useWeather();

  if (loadingWeather || !weather) {
    return (
      <div className="grid grid-cols-2 gap-4 w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[130px] rounded-3xl bg-muted/30 border border-border/30" />
        ))}
      </div>
    );
  }

  // Safely traverse the OpenWeatherMap data structure
  const current = weather.current || weather;
  const main = current?.main || current;
  const wind = current?.wind || current;

  const humidity = main?.humidity ?? current?.humidity ?? 0;
  const windSpeed = wind?.speed ?? current?.wind_kph ?? 0;
  
  // OWM returns visibility in meters; convert to kilometers
  const visibility = current?.visibility 
    ? (current.visibility / 1000).toFixed(1) 
    : (current?.vis_km ?? 0);
  
  const rawFeelsLike = main?.feels_like ?? current?.feelslike_c ?? current?.temp ?? 0;
  const feelsLike = unit === "C" ? Math.round(rawFeelsLike) : Math.round((rawFeelsLike * 9) / 5 + 32);

  const pressure = main?.pressure ?? current?.pressure_mb ?? 0;
  
  // UV Index typically requires the OneCall API in OWM
  const uvIndex = current?.uvi ?? current?.uv ?? "N/A";

  const metrics = [
    {
      label: "UV Index",
      value: uvIndex.toString(),
      icon: Sun,
      description: "Solar radiation",
    },
    {
      label: "Humidity",
      value: `${humidity}%`,
      icon: Droplets,
      description: "Moisture level",
    },
    {
      label: "Wind Speed",
      value: `${windSpeed} m/s`,
      icon: Wind,
      description: "Current velocity",
    },
    {
      label: "Visibility",
      value: `${visibility} km`,
      icon: Eye,
      description: "Clear line of sight",
    },
    {
      label: "Feels Like",
      value: `${feelsLike}°${unit}`,
      icon: Thermometer,
      description: "Perceived heat",
    },
    {
      label: "Pressure",
      value: `${pressure} hPa`,
      icon: Gauge,
      description: "Atmospheric force",
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {metrics.map((metric, index) => (
        <MetricCard 
          key={index}
          label={metric.label}
          value={metric.value}
          icon={metric.icon}
          description={metric.description}
          isCrisisMode={isCrisisMode}
        />
      ))}
    </div>
  );
}

function MetricCard({ 
  label, 
  value, 
  icon: Icon, 
  description,
  isCrisisMode 
}: { 
  label: string; 
  value: string; 
  icon: React.ElementType; 
  description: string;
  isCrisisMode: boolean;
}) {
  return (
    <div className={`
      relative overflow-hidden rounded-3xl p-5 flex flex-col justify-between h-[130px]
      bg-muted/30 border border-border/30 transition-all duration-300
      ${isCrisisMode ? "border-destructive/40 shadow-sm shadow-destructive/10" : "hover:bg-muted/50"}
    `}>
      <div className="flex justify-between items-start w-full">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-sans">
          {label}
        </span>
        <Icon className={`w-4 h-4 ${isCrisisMode ? "text-destructive" : "text-primary/70"}`} />
      </div>
      
      <div className="mt-auto">
        <div className="text-2xl font-semibold tracking-tight text-foreground font-sans">
          {value}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">
          {description}
        </div>
      </div>
    </div>
  );
}