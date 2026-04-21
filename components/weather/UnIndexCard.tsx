"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAppStore } from "@/store/useAppStore";
import { Skeleton } from "@/components/ui/skeleton";

export default function UvIndexCard() {
  const { targetLocation } = useAppStore();
  const [uvData, setUvData] = useState<{ index: number; isDay: number } | null>(null);

  useEffect(() => {
    if (!targetLocation) return;

    const fetchUV = async () => {
      try {
        const safeLon = (targetLocation as any).lon ?? (targetLocation as any).lng ?? (targetLocation as any).longitude;
        if (safeLon === undefined) return;

        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${targetLocation.lat}&longitude=${safeLon}&current=uv_index,is_day`);
        if (!res.ok) throw new Error("Failed to fetch UV data");
        const data = await res.json();
        
        setUvData({
          index: Math.round(data.current.uv_index),
          isDay: data.current.is_day
        });
      } catch (error) {
        console.error("UV fetch error:", error);
      }
    };

    fetchUV();
  }, [targetLocation]);

  if (uvData === null) {
    return <Skeleton className="w-full h-[100px] rounded-3xl bg-primary/20" />;
  }

  const { index: uvIndex, isDay } = uvData;

  let status = "Low";
  let message = "Low risk of UV rays. Enjoy the outdoors.";
  let badgeColor = "bg-primary-foreground/20 text-primary-foreground";
  
  if (isDay === 0) {
    status = "Night";
    message = "Nighttime conditions. No UV protection required.";
  } else if (uvIndex >= 3 && uvIndex <= 5) {
    status = "Moderate";
    message = "Moderate risk of UV rays. Wear sunscreen and a hat.";
    badgeColor = "bg-yellow-400/20 text-yellow-100";
  } else if (uvIndex >= 6 && uvIndex <= 7) {
    status = "High";
    message = "High risk of UV rays. Seek shade during midday hours.";
    badgeColor = "bg-orange-400/20 text-orange-100";
  } else if (uvIndex >= 8 && uvIndex <= 10) {
    status = "Very High";
    message = "Very high risk of UV rays. Avoid outside activities.";
    badgeColor = "bg-red-400/20 text-red-100";
  } else if (uvIndex >= 11) {
    status = "Extreme";
    message = "Extreme risk of UV rays. Stay indoors if possible.";
    badgeColor = "bg-purple-400/20 text-purple-100";
  }

  return (
    <div className="w-full bg-primary text-primary-foreground rounded-3xl p-6 flex items-center gap-5 shadow-sm transition-all hover:shadow-md font-sans">
      
      <div className="shrink-0 flex items-center justify-center bg-primary-foreground/10 rounded-full p-3">
        <Image 
          src="/sun-uv-symbol.webp" 
          alt="Sun UV Symbol" 
          width={44} 
          height={44} 
          className="object-contain drop-shadow-md"
          priority
        />
      </div>

      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <span className="text-3xl font-bold tracking-tight leading-none">
            {uvIndex} UVI
          </span>
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${badgeColor}`}>
            {status}
          </div>
        </div>
        
        <p className="text-sm font-medium leading-snug opacity-90 truncate whitespace-normal">
          {message}
        </p>
      </div>

    </div>
  );
}