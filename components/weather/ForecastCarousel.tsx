"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Cloud, CloudRain, Sun, CloudLightning } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useAppStore } from "@/store/useAppStore";
import { Skeleton } from "@/components/ui/skeleton";

const getWeatherIcon = (desc?: string) => {
  const safeDesc = (desc || "").toLowerCase();
  if (safeDesc.includes("rain")) return <CloudRain className="h-6 w-6 text-primary/70" />;
  if (safeDesc.includes("cloud")) return <Cloud className="h-6 w-6 text-muted-foreground" />;
  if (safeDesc.includes("thunder")) return <CloudLightning className="h-6 w-6 text-primary/70" />;
  return <Sun className="h-6 w-6 text-primary/70" />;
};

export default function ForecastCarousel() {
  const { twelveHourForecast, loadingWeather } = useWeather();
  const { unit } = useAppStore();

  if (loadingWeather || !twelveHourForecast) {
    return (
      <div className="flex gap-4 overflow-hidden w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[140px] w-full rounded-3xl bg-muted/30 border border-border/30" />
        ))}
      </div>
    );
  }

  if (twelveHourForecast.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        No forecast sequence available.
      </div>
    );
  }

  return (
    <div className="w-full relative px-2">
      <Carousel opts={{ align: "start", loop: false }} className="w-full">
        <CarouselContent className="-ml-4">
          {twelveHourForecast.map((info: any, index: number) => {
            const dateObj = new Date(info.dt * 1000);
            const timeString = info.isCurrent ? "Now" : dateObj.toLocaleTimeString([], { hour: 'numeric' });
            
            const rawTemp = info.main?.temp ?? 0;
            const displayTemp = unit === "C" ? Math.round(rawTemp) : Math.round((rawTemp * 9) / 5 + 32);

            return (
              <CarouselItem key={index} className="pl-4 basis-1/2 md:basis-1/3 xl:basis-1/4">
                <div className="flex flex-col items-center justify-center p-5 rounded-3xl bg-muted/30 border border-border/30 h-full hover:bg-muted/50 transition-all duration-300">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-sans mb-3 text-center">
                    {timeString}
                  </span>
                  <div className="mb-3">
                    {getWeatherIcon(info.weather?.[0]?.description)}
                  </div>
                  <span className="text-xl font-bold tracking-tight text-foreground font-sans">
                    {displayTemp}°
                  </span>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="-left-4 bg-background/50 border-border/20" />
          <CarouselNext className="-right-4 bg-background/50 border-border/20" />
        </div>
      </Carousel>
    </div>
  );
}