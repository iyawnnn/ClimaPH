"use client";

import { useWeather } from "@/hooks/useWeather";
import { Skeleton } from "@/components/ui/skeleton";

export default function TomorrowPreview() {
  const { fiveDayForecast, loadingWeather } = useWeather();

  if (loadingWeather || !fiveDayForecast) {
    return <Skeleton className="w-full h-full min-h-[250px] rounded-[2rem] bg-muted/20 border-none" />;
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);

  let tomorrowData = fiveDayForecast.find((item: any) => {
    const itemDate = new Date(item.dt * 1000);
    return itemDate.getDate() === tomorrow.getDate() && itemDate.getHours() >= 11 && itemDate.getHours() <= 14;
  });

  if (!tomorrowData) {
    tomorrowData = fiveDayForecast.find((item: any) => {
      const itemDate = new Date(item.dt * 1000);
      return itemDate.getDate() === tomorrow.getDate();
    });
  }

  if (!tomorrowData) return null;

  const temp = Math.round(tomorrowData.main.temp);
  const condition = tomorrowData.weather[0].main; 
  
  let conditionText = "Sunny";
  if (condition === "Rain" || condition === "Drizzle") {
    conditionText = "Rainy";
  } else if (condition === "Clouds") {
    conditionText = "Cloudy";
  } else if (condition === "Thunderstorm") {
    conditionText = "Stormy";
  } else if (condition === "Clear") {
    conditionText = "Sunny";
  }

  const formattedDate = tomorrow.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="relative flex flex-col w-full h-full min-h-[250px] justify-between p-2 z-10">
      <div className="flex flex-col items-start text-left">
        <h3 className="text-2xl font-bold tracking-tight text-foreground font-sans uppercase">
          Tomorrow
        </h3>
        <p className="text-sm font-medium text-muted-foreground font-sans mt-0.5">
          {formattedDate}
        </p>
      </div>

      <div className="flex flex-col items-end text-left mt-auto">
        <span className="text-6xl font-bold tracking-tighter text-foreground font-sans leading-none">
          {temp}°C
        </span>
        <span className="text-sm font-bold text-foreground/80 uppercase tracking-widest font-sans mt-2">
          {conditionText}
        </span>
      </div>
    </div>
  );
}