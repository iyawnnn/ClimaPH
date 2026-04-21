"use client";

import { useEffect, useState } from "react";
import { useWeather } from "@/hooks/useWeather";
import { useAppStore } from "@/store/useAppStore";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function SolarProgression() {
  const { weather, loadingWeather } = useWeather();
  const { targetLocation, unit } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [sunsetDisplay, setSunsetDisplay] = useState("--:--");
  const [sunriseDisplay, setSunriseDisplay] = useState("--:--");

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!weather) return;

    const getTimestamps = () => {
      const now = new Date().getTime();
      let sunriseTime = new Date().setHours(6, 0, 0, 0); 
      let sunsetTime = new Date().setHours(18, 0, 0, 0); 
      let srDisplay = "06:00 AM";
      let ssDisplay = "06:00 PM";

      const astro = weather.forecast?.forecastday?.[0]?.astro;
      if (astro?.sunrise && astro?.sunset) {
        const today = new Date().toDateString();
        sunriseTime = new Date(`${today} ${astro.sunrise}`).getTime();
        sunsetTime = new Date(`${today} ${astro.sunset}`).getTime();
        srDisplay = astro.sunrise;
        ssDisplay = astro.sunset;
      } else if (weather.sys?.sunrise && weather.sys?.sunset) {
        sunriseTime = weather.sys.sunrise * 1000;
        sunsetTime = weather.sys.sunset * 1000;
        srDisplay = new Date(sunriseTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        ssDisplay = new Date(sunsetTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      }

      setSunriseDisplay(srDisplay);
      setSunsetDisplay(ssDisplay);

      return { now, sunriseTime, sunsetTime };
    };

    const { now, sunriseTime, sunsetTime } = getTimestamps();
    
    let currentProgress = (now - sunriseTime) / (sunsetTime - sunriseTime);
    currentProgress = Math.max(0, Math.min(1, currentProgress)); 
    
    setProgress(currentProgress);
  }, [weather]);

  if (!mounted || loadingWeather) {
    return <Skeleton className="w-full h-64 rounded-3xl bg-transparent" />;
  }

  const radius = 130;
  const cx = 160;
  const cy = 150;
  const strokeWidth = 3;
  
  const angle = Math.PI * (1 - progress);
  const sunX = cx + radius * Math.cos(angle);
  const sunY = cy - radius * Math.sin(angle);

  const arcPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  // Safely extract temperature handling both OpenWeatherMap and WeatherAPI formats
  const rawTempC = weather?.current?.temp_c ?? weather?.main?.temp ?? weather?.current?.temp ?? 0;
  const rawTempF = weather?.current?.temp_f ?? (rawTempC * 9) / 5 + 32;
  const displayTemp = unit === "C" ? Math.round(rawTempC) : Math.round(rawTempF);

  const displayLocation = targetLocation?.display || weather?.location?.name || weather?.name || "Unknown Location";

  return (
    <div className="w-full flex flex-col pt-2 pb-4 font-sans select-none">
      
      {/* Redesigned Header */}
      <div className="flex justify-between items-start w-full mb-8 px-2">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Daylight Cycle
          </h2>
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
            {displayLocation}
          </span>
          <div className="h-[1px] w-8 bg-border/60 mt-3 rounded-full" />
        </div>
        <div className="flex items-start">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {displayTemp}°
          </span>
        </div>
      </div>

      <div className="w-full flex items-center justify-center">
        <svg
          viewBox="0 0 320 180"
          className="w-full max-w-sm overflow-visible drop-shadow-sm"
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <path
            d={arcPath}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray="4 8"
            strokeLinecap="round"
            className="text-muted-foreground/30"
          />

          <motion.path
            d={arcPath}
            fill="none"
            stroke="url(#sunGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          <motion.g
            initial={{ opacity: 0, x: cx - radius, y: cy }}
            animate={{ opacity: 1, x: sunX, y: sunY }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <circle r="6" fill="#f59e0b" filter="url(#glow)" />
            <circle r="12" fill="none" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.4" />
            <circle r="18" fill="none" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.1" />
          </motion.g>

          <text
            x={cx}
            y={cy - 40}
            textAnchor="middle"
            className="text-4xl font-bold fill-foreground tracking-tighter"
          >
            {currentTime}
          </text>
          <text
            x={cx}
            y={cy - 16}
            textAnchor="middle"
            className="text-xs font-semibold fill-muted-foreground uppercase tracking-widest"
          >
            Sunset at {sunsetDisplay}
          </text>

          <text
            x={cx - radius}
            y={cy + 24}
            textAnchor="middle"
            className="text-[10px] font-bold fill-muted-foreground uppercase tracking-wider"
          >
            Sunrise
          </text>

          <text
            x={cx + radius}
            y={cy + 24}
            textAnchor="middle"
            className="text-[10px] font-bold fill-muted-foreground uppercase tracking-wider"
          >
            Sunset
          </text>
        </svg>
      </div>
    </div>
  );
}