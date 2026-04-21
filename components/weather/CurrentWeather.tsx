"use client";

import { useWeather } from "@/hooks/useWeather";
import { useAppStore } from "@/store/useAppStore";
import { Cloud, CloudRain, Sun, CloudLightning, Droplets, Gauge, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const getWeatherIcon = (desc?: string) => {
  const safeDesc = (desc || "").toLowerCase();
  if (safeDesc.includes("rain")) return <CloudRain className="h-20 w-20 lg:h-24 lg:w-24 text-[#0038A8] opacity-80" strokeWidth={1} />;
  if (safeDesc.includes("cloud")) return <Cloud className="h-20 w-20 lg:h-24 lg:w-24 text-muted-foreground opacity-80" strokeWidth={1} />;
  if (safeDesc.includes("thunder")) return <CloudLightning className="h-20 w-20 lg:h-24 lg:w-24 text-[#CE1126] opacity-80" strokeWidth={1} />;
  return <Sun className="h-20 w-20 lg:h-24 lg:w-24 text-[#FCD116] opacity-80" strokeWidth={1} />;
};

export default function CurrentWeather() {
  const { weather, loadingWeather } = useWeather();
  const { targetLocation, unit, isCrisisMode } = useAppStore();

  if (loadingWeather || !weather) {
    return <Skeleton className="w-full h-full min-h-[380px] rounded-[2rem] bg-muted/20 border-none" />;
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

  const getHumStatus = (h: number) => h < 30 ? "Dry" : h <= 60 ? "Comfort" : "Humid";
  const getPressStatus = (p: number) => p < 1000 ? "Low" : p <= 1020 ? "Normal" : "High";
  const getVisStatus = (v: number) => v < 5 ? "Poor" : v < 10 ? "Moderate" : "Clear";

  const themeColor = isCrisisMode ? "text-[#CE1126]" : "text-[#0038A8]";

  return (
    <div className="flex flex-col justify-between h-full w-full relative z-10">
      
      <div className="flex justify-between items-start">
        <div className="flex flex-col z-10 w-[70%]">
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground font-sans leading-tight">
            {targetLocation?.display || "Unknown Location"}
          </h2>
          <p className="text-base text-muted-foreground capitalize font-sans mt-1">{description}</p>
        </div>
        <div className="absolute top-0 right-0 z-0 drop-shadow-xl pointer-events-none">
          {getWeatherIcon(description)}
        </div>
      </div>
      
      <div className="relative z-10 mt-auto pt-2 pb-6">
        <div className="text-7xl lg:text-8xl font-bold tracking-tighter text-foreground font-sans leading-none">
          {displayTemp}°<span className="text-4xl text-muted-foreground ml-1">{unit}</span>
        </div>
        <div className="flex gap-4 mt-4">
          <span className="text-base font-semibold text-foreground tracking-wide">H: {displayHigh}°</span>
          <span className="text-base font-medium text-muted-foreground tracking-wide">L: {displayLow}°</span>
        </div>
      </div>

      {/* The 3 enclosed mini-cards */}
      <div className="grid grid-cols-3 gap-3 w-full mt-auto relative z-10">
        <CompactStat icon={Droplets} label="Humidity" value={`${humidity}%`} status={getHumStatus(humidity)} themeColor={themeColor} />
        <CompactStat icon={Gauge} label="Pressure" value={`${pressure} hPa`} status={getPressStatus(pressure)} themeColor={themeColor} />
        <CompactStat icon={Eye} label="Visibility" value={`${visibility} km`} status={getVisStatus(parseFloat(visibility as string))} themeColor={themeColor} />
      </div>

    </div>
  );
}

function CompactStat({ icon: Icon, label, value, status, themeColor }: { icon: React.ElementType, label: string, value: string, status: string, themeColor: string }) {
  return (
    <div className="flex flex-col p-4 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${themeColor}`} strokeWidth={2.5} />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">{label}</span>
      </div>
      <span className="text-xl lg:text-2xl font-bold text-foreground leading-none mb-1.5">{value}</span>
      <span className="text-xs font-medium text-muted-foreground">{status}</span>
    </div>
  );
}