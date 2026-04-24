"use client";

import { useEffect, useState, useMemo } from "react";
import { useWeather } from "@/hooks/useWeather";
import { useAppStore } from "@/store/useAppStore";
import { Skeleton } from "@/components/ui/skeleton";

export default function SolarProgression() {
  const { weather, loadingWeather } = useWeather();
  const { targetLocation, unit } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Single timer to drive the entire component's updates
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Derive all time and progress calculations natively during render using useMemo
  const { progress, sunriseDisplay, sunsetDisplay, currentTime } = useMemo(() => {
    let sunriseTime = new Date().setHours(6, 0, 0, 0);
    let sunsetTime = new Date().setHours(18, 0, 0, 0);
    let srDisplay = "--:--";
    let ssDisplay = "--:--";

    const formattedTime = new Date(now).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    if (weather) {
      srDisplay = "06:00 AM";
      ssDisplay = "06:00 PM";
      
      const parseTimeString = (timeStr: string) => {
        try {
          const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (match) {
            let hrs = parseInt(match[1], 10);
            const mins = parseInt(match[2], 10);
            const isPM = match[3].toUpperCase() === "PM";
            if (hrs === 12) hrs = isPM ? 12 : 0;
            else if (isPM) hrs += 12;
            
            const d = new Date(now);
            d.setHours(hrs, mins, 0, 0);
            return d.getTime();
          }
          return new Date(`${new Date(now).toDateString()} ${timeStr}`).getTime();
        } catch {
          return null;
        }
      };

      const astro = weather.forecast?.forecastday?.[0]?.astro;
      if (astro?.sunrise && astro?.sunset) {
        const parsedSr = parseTimeString(astro.sunrise);
        const parsedSs = parseTimeString(astro.sunset);
        
        if (parsedSr && parsedSs) {
          sunriseTime = parsedSr;
          sunsetTime = parsedSs;
        }
        srDisplay = astro.sunrise;
        ssDisplay = astro.sunset;
      } else if (weather.sys?.sunrise && weather.sys?.sunset) {
        sunriseTime = weather.sys.sunrise * 1000;
        sunsetTime = weather.sys.sunset * 1000;
        srDisplay = new Date(sunriseTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        ssDisplay = new Date(sunsetTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      }
    }

    let currentProgress = 0;
    if (sunsetTime > sunriseTime) {
      currentProgress = (now - sunriseTime) / (sunsetTime - sunriseTime);
    }
    
    currentProgress = Math.max(0, Math.min(1, currentProgress)); 
    if (isNaN(currentProgress)) currentProgress = 0;

    return {
      progress: currentProgress,
      sunriseDisplay: srDisplay,
      sunsetDisplay: ssDisplay,
      currentTime: formattedTime
    };
  }, [weather, now]);

  if (!mounted || loadingWeather) {
    return <Skeleton className="w-full h-64 rounded-3xl bg-transparent" />;
  }

  const radius = 130;
  const cx = 160;
  const cy = 150;
  const strokeWidth = 3;
  
  const arcLength = Math.PI * radius;
  const angle = Math.PI * (1 - progress);
  const sunX = cx + radius * Math.cos(angle);
  const sunY = cy - radius * Math.sin(angle);

  const arcPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  const rawTempC = weather?.current?.temp_c ?? weather?.main?.temp ?? weather?.current?.temp ?? 0;
  const rawTempF = weather?.current?.temp_f ?? (rawTempC * 9) / 5 + 32;
  const displayTemp = unit === "C" ? Math.round(rawTempC) : Math.round(rawTempF);

  const displayLocation = targetLocation?.display || weather?.location?.name || weather?.name || "Unknown Location";

  return (
    <div className="w-full flex flex-col pt-0 -mt-2 pb-4 font-sans select-none">
      
      <div className="flex justify-between items-start w-full mb-6 px-2 pb-4 border-b border-border/50">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Daylight Cycle
          </h2>
          <span className="text-sm text-foreground/70 truncate max-w-[200px]">
            {displayLocation}
          </span>
        </div>
        <div className="flex items-start">
          <span className="text-3xl font-bold tracking-tight text-primary dark:text-secondary transition-colors duration-300">
            {displayTemp}°{unit}
          </span>
        </div>
      </div>

      <div className="w-full flex items-center justify-center pt-2">
        <svg
          viewBox="0 0 320 180"
          className="w-full max-w-sm overflow-visible"
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          <line 
            x1={cx - radius - 15} 
            y1={cy} 
            x2={cx + radius + 15} 
            y2={cy} 
            stroke="url(#sunGradient)" 
            strokeWidth="1.5" 
            strokeOpacity="0.4"
          />

          <path
            d={arcPath}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray="4 8"
            strokeLinecap="round"
            className="text-border"
          />

          <path
            d={arcPath}
            fill="none"
            stroke="url(#sunGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={arcLength * (1 - progress)}
          />

          <circle cx={cx - radius} cy={cy} r="4" fill="currentColor" className="text-primary dark:text-secondary transition-colors duration-300" />
          <circle cx={cx + radius} cy={cy} r="4" fill="currentColor" className="text-primary dark:text-secondary transition-colors duration-300" />

          <g transform={`translate(${sunX}, ${sunY})`}>
            <circle r="6" fill="#f59e0b" />
            <circle r="12" fill="none" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.4" />
            <circle r="18" fill="none" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.1" />
          </g>

          <text
            x={cx}
            y={cy - 55}
            textAnchor="middle"
            className="text-3xl font-bold fill-foreground tracking-tight"
          >
            {currentTime}
          </text>
          <text
            x={cx}
            y={cy - 28}
            textAnchor="middle"
            className="text-sm font-medium fill-foreground"
          >
            Sunset at {sunsetDisplay}
          </text>

          <text
            x={cx - radius}
            y={cy + 24}
            textAnchor="middle"
            className="text-sm font-medium fill-foreground"
          >
            Sunrise
          </text>

          <text
            x={cx + radius}
            y={cy + 24}
            textAnchor="middle"
            className="text-sm font-medium fill-foreground"
          >
            Sunset
          </text>
        </svg>
      </div>
    </div>
  );
}