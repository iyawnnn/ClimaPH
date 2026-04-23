"use client";

import { useWeather } from "@/hooks/useWeather";
import { useAppStore } from "@/store/useAppStore";
import {
  Cloud,
  CloudRain,
  Sun,
  CloudLightning,
  Droplets,
  Gauge,
  Eye,
  Star,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const getWeatherIcon = (desc?: string) => {
  const safeDesc = (desc || "").toLowerCase();
  if (safeDesc.includes("rain"))
    return <CloudRain className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 text-[#0038A8] opacity-80" strokeWidth={1} />;
  if (safeDesc.includes("cloud"))
    return <Cloud className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 text-muted-foreground opacity-80" strokeWidth={1} />;
  if (safeDesc.includes("thunder"))
    return <CloudLightning className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 text-[#CE1126] opacity-80" strokeWidth={1} />;
  return <Sun className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 text-[#FCD116] opacity-80" strokeWidth={1} />;
};

export default function CurrentWeather() {
  const { weather, loadingWeather } = useWeather();
  const { targetLocation, unit, isCrisisMode, favorites, toggleFavorite } = useAppStore();

  if (loadingWeather || !weather) {
    return <Skeleton className="w-full h-full min-h-[300px] md:min-h-[380px] rounded-[2rem] bg-muted/20 border-none" />;
  }

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
  const pressure = main?.pressure ?? current?.pressure_mb ?? 0;
  const visibility = current?.visibility ? (current.visibility / 1000).toFixed(1) : (current?.vis_km ?? 0);
  const humidity = main?.humidity ?? current?.humidity ?? 0;

  const themeColor = isCrisisMode ? "text-[#CE1126]" : "text-[#0038A8]";
  const isFavorited = targetLocation ? favorites.some((f) => f.display === targetLocation.display) : false;

  return (
    <div className="flex flex-col justify-between h-full w-full relative z-10">
      <div className="flex justify-between items-start">
        <div className="flex flex-col z-10 w-[75%] gap-2">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-sans leading-tight pr-2">
            {targetLocation?.display || "Unknown Location"}
          </h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm md:text-base text-muted-foreground capitalize font-sans font-medium">
              {description}
            </span>
            
            {targetLocation && (
              <>
                <div className="w-1 h-1 rounded-full bg-border/60" />
                <button
                  onClick={() => toggleFavorite(targetLocation)}
                  className="group flex items-center gap-1.5 text-xs md:text-sm font-semibold transition-all outline-none"
                >
                  <Star
                    className={`w-3.5 h-3.5 transition-all duration-300 ${
                      isFavorited 
                        ? "fill-[#FCD116] text-[#FCD116]" 
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                    strokeWidth={isFavorited ? 0 : 2}
                  />
                  <span className={isFavorited ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}>
                    {isFavorited ? "Saved" : "Save Location"}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="absolute top-0 right-0 z-0 drop-shadow-xl pointer-events-none">
          {getWeatherIcon(description)}
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-4 pb-4 md:pb-6">
        <div className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter text-foreground font-sans leading-none">
          {displayTemp}°
          <span className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground ml-1">{unit}</span>
        </div>
        <div className="flex gap-4 mt-3">
          <span className="text-sm md:text-base font-semibold text-foreground tracking-wide font-sans">H: {displayHigh}°</span>
          <span className="text-sm md:text-base font-medium text-muted-foreground tracking-wide font-sans">L: {displayLow}°</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3 w-full mt-auto relative z-10">
        <CompactStat icon={Droplets} label="Humidity" value={`${humidity}%`} themeColor={themeColor} />
        <CompactStat icon={Gauge} label="Pressure" value={`${pressure} hPa`} themeColor={themeColor} />
        <CompactStat icon={Eye} label="Visibility" value={`${visibility} km`} themeColor={themeColor} />
      </div>
    </div>
  );
}

function CompactStat({ icon: Icon, label, value, themeColor }: { icon: React.ElementType; label: string; value: string; themeColor: string; }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-2.5 md:p-4 rounded-xl md:rounded-2xl bg-muted/30 border border-border/10 hover:bg-muted/50 transition-colors min-w-0">
      <div className="flex items-center justify-center gap-1.5 md:gap-2 mb-2 w-full">
        <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 ${themeColor}`} strokeWidth={2.5} />
        <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest leading-tight truncate font-sans">{label}</span>
      </div>
      <span className="text-base md:text-lg lg:text-xl font-bold text-foreground leading-none whitespace-nowrap tracking-tight font-sans">{value}</span>
    </div>
  );
}