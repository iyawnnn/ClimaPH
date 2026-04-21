"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useWeather } from "@/hooks/useWeather";
import { Leaf, Wind } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateAQI } from "@/lib/weather-utils";

export default function LifestyleGrid() {
  const { isCrisisMode, targetLocation } = useAppStore();
  const { weather, loadingWeather } = useWeather();
  const [realAqi, setRealAqi] = useState<number | null>(null);
  const [pm25, setPm25] = useState<number | null>(null);

  useEffect(() => {
    if (!targetLocation) return;

    const fetchAirQuality = async () => {
      try {
        const safeLon = (targetLocation as any).lon ?? (targetLocation as any).lng ?? (targetLocation as any).longitude;
        if (safeLon === undefined) return;

        const response = await fetch(`/api/telemetry?lat=${targetLocation.lat}&lon=${safeLon}`);
        if (!response.ok) throw new Error("Failed to fetch telemetry");
        
        const result = await response.json();
        const rawPm25 = result.airData.list[0].components.pm2_5;
        
        setPm25(rawPm25);
        setRealAqi(calculateAQI(rawPm25));
      } catch (error) {
        console.error("Air quality fetch error:", error);
      }
    };

    fetchAirQuality();
  }, [targetLocation]);

  if (loadingWeather || !weather || realAqi === null) {
    return <Skeleton className="w-full h-full min-h-[380px] rounded-[2rem] bg-muted/20 border-none" />;
  }

  const current = weather.current || weather;
  
  // 1. Wind Direction Logic
  const windDegrees = current?.wind?.deg ?? current?.wind_degree ?? 270;
  const getWindDirection = (deg: number) => {
    if (deg > 337.5 || deg <= 22.5) return "North Wind";
    if (deg > 22.5 && deg <= 67.5) return "Northeast Wind";
    if (deg > 67.5 && deg <= 112.5) return "East Wind";
    if (deg > 112.5 && deg <= 157.5) return "Southeast Wind";
    if (deg > 157.5 && deg <= 202.5) return "South Wind";
    if (deg > 202.5 && deg <= 247.5) return "Southwest Wind";
    if (deg > 247.5 && deg <= 292.5) return "West Wind";
    if (deg > 292.5 && deg <= 337.5) return "Northwest Wind";
    return "Variable Wind";
  };
  const windDirection = getWindDirection(windDegrees);

  // 2. Status and Theme Colors
  let aqiValue = realAqi;
  let aqiStatus = "Good";
  let statusColor = "text-[#0038A8]"; 
  let statusBg = "bg-[#0038A8]/10";

  if (aqiValue > 50) {
    aqiStatus = "Moderate";
    statusColor = "text-[#FCD116]"; 
    statusBg = "bg-[#FCD116]/10";
  }
  if (aqiValue > 100) {
    aqiStatus = "Unhealthy";
    statusColor = "text-[#CE1126]"; 
    statusBg = "bg-[#CE1126]/10";
  }
  if (isCrisisMode) {
    aqiStatus = "Hazardous";
    aqiValue = aqiValue < 150 ? aqiValue + 100 : aqiValue;
    statusColor = "text-[#CE1126]";
    statusBg = "bg-[#CE1126]/10";
  }

  const aqiPercent = Math.min((aqiValue / 300) * 100, 100);

  return (
    <div className="flex flex-col justify-between h-full w-full relative z-10">
      
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col z-10">
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground font-sans leading-tight">
            Air Quality
          </h2>
          <p className="text-base text-muted-foreground capitalize font-sans mt-1">
            Particulate Matter: PM2.5 ({pm25} µg/m³)
          </p>
        </div>
        <Leaf className={`h-8 w-8 ${statusColor} opacity-50`} strokeWidth={2} />
      </div>
      
      {/* Huge Value Section & Wind Direction */}
      <div className="flex flex-col items-start justify-center flex-1 w-full z-10 mt-4 mb-6">
        
        <div className="flex items-center gap-4">
          <div className="text-7xl lg:text-8xl font-bold tracking-tighter text-foreground font-sans leading-none drop-shadow-sm">
            {aqiValue}
          </div>
          <div className={`px-4 py-2 rounded-xl ${statusBg} ${statusColor} text-sm font-bold tracking-widest uppercase shadow-sm border border-border/20 font-sans`}>
            AQI - {aqiStatus}
          </div>
        </div>

        <div className="mt-4 text-base font-medium text-muted-foreground font-sans flex items-center gap-2">
          <Wind className="w-5 h-5 opacity-70" strokeWidth={2} />
          {windDirection}
        </div>

      </div>

      {/* Enclosed Progress Bar Card */}
      <div className="w-full mt-auto p-5 rounded-2xl bg-muted/30 border border-border/40 flex flex-col shadow-sm z-10">
        
        {/* Risk Scale Headers */}
        <div className="flex justify-between items-end mb-3 font-sans">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Risk Scale</span>
          <span className="text-xs font-bold text-foreground">{aqiValue} / 300+</span>
        </div>
        
        {/* The Smooth Gradient Gauge */}
        <div className="relative h-3 w-full bg-gradient-to-r from-[#0038A8] via-[#FCD116] to-[#CE1126] rounded-full overflow-visible shadow-inner border border-border/20">
          
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-background border-[4px] border-foreground rounded-full shadow-md transition-all duration-1000 ease-out z-20"
            style={{ left: `${aqiPercent}%` }}
          />

        </div>

        {/* Clean Scale Labels */}
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-3 font-sans">
          <span>Good</span>
          <span>Hazard</span>
        </div>

      </div>

    </div>
  );
}