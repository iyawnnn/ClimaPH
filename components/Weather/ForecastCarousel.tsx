"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, CloudLightning } from "lucide-react";

type ForecastCarouselProps = {
  data: any; // The 5-day forecast object
  unit: "C" | "F";
};

// Helper to convert temp
const convertTemp = (temp: number, unit: "C" | "F") =>
  unit === "C" ? Math.round(temp) : Math.round((temp * 9) / 5 + 32);

// Helper for Icons
const getWeatherIcon = (desc: string) => {
  if (desc.includes("rain")) return <CloudRain className="h-8 w-8 text-blue-500" />;
  if (desc.includes("cloud")) return <Cloud className="h-8 w-8 text-gray-500" />;
  if (desc.includes("thunder")) return <CloudLightning className="h-8 w-8 text-purple-500" />;
  return <Sun className="h-8 w-8 text-yellow-500" />;
};

export default function ForecastCarousel({ data, unit }: ForecastCarouselProps) {
  // Convert object to array for mapping
  const days = Object.entries(data);

  return (
    <div className="px-10 py-4">
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {days.map(([date, info]: any, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="flex flex-col items-center justify-center p-4 aspect-square">
                  <span className="text-sm font-semibold text-muted-foreground mb-2 text-center">
                    {date}
                  </span>
                  <div className="mb-2">
                    {getWeatherIcon(info.description)}
                  </div>
                  <div className="flex gap-2 items-end">
                    <span className="text-2xl font-bold">
                      {convertTemp(info.high, unit)}°
                    </span>
                    <span className="text-sm text-muted-foreground mb-1">
                      {convertTemp(info.low, unit)}°
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize mt-1 text-center">
                    {info.description}
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}