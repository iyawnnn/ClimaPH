"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateDailyNecessities } from "@/lib/weather-heuristics";
import type { ForecastItem } from "@/types/types";
import { Umbrella, Shirt } from "lucide-react";

interface LifestyleCheckerProps {
  forecastList: ForecastItem[] | null;
}

export default function LifestyleChecker({ forecastList }: LifestyleCheckerProps) {
  const data = useMemo(() => {
    if (!forecastList) return null;
    return calculateDailyNecessities(forecastList);
  }, [forecastList]);

  if (!data) return null;

  return (
    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-none bg-transparent h-full flex flex-col justify-center">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium tracking-tight text-neutral-500 uppercase">
          Daily Necessities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Umbrella Block */}
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-md ${data.needsUmbrella ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'}`}>
            <Umbrella className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {data.needsUmbrella ? "Bring an Umbrella" : "No Umbrella Needed"}
            </p>
            <p className="text-xs text-neutral-500">{data.umbrellaReason}</p>
          </div>
        </div>

        {/* Laundry Block */}
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-md ${data.canDoLaundry ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {data.canDoLaundry ? "Safe for Laundry" : "Hold off on Laundry"}
            </p>
            <p className="text-xs text-neutral-500">{data.laundryReason}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}