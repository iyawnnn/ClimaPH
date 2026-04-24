"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import MapFloatingControls from "@/components/map/MapFloatingControls";

const WeatherMap = dynamic(
  () => import("@/components/weather/WeatherMap"),
  { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-full rounded-none bg-primary/10" />
  }
);

export default function MapPage() {
  return (
    <div className="relative flex-1 w-full min-h-0 bg-background overflow-hidden border-t border-border/20 isolate">
      <Suspense fallback={<Skeleton className="w-full h-full rounded-none bg-primary/10" />}>
        <div className="absolute inset-0 z-0">
          <WeatherMap />
        </div>
      </Suspense>

      <MapFloatingControls />
    </div>
  );
}