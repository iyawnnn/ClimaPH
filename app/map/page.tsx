"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import MapFloatingControls from "@/components/map/MapFloatingControls";

const WeatherMap = dynamic(
  () => import("@/components/weather/WeatherMap"),
  { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-full rounded-none" />
  }
);

export default function MapPage() {
  return (
    // 'flex-1' and 'h-full' force the container to stretch perfectly to the bottom
    <div className="relative w-full h-full min-h-[calc(100dvh-5rem)] flex-1 bg-background overflow-hidden rounded-none border-t border-border/20 isolate">
      <Suspense fallback={<Skeleton className="w-full h-full rounded-none" />}>
        <div className="absolute inset-0 z-0">
          <WeatherMap />
        </div>
      </Suspense>

      <MapFloatingControls />
    </div>
  );
}