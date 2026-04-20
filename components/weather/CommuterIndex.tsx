"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateCommuterRisk } from "@/lib/weather-heuristics";
import type { ForecastItem } from "@/types/types";
import { AlertTriangle, CloudRain, Wind, Sun } from "lucide-react";

interface CommuterIndexProps {
  forecastList: ForecastItem[] | null;
}

export default function CommuterIndex({ forecastList }: CommuterIndexProps) {
  const riskData = useMemo(() => {
    if (!forecastList) return null;
    return calculateCommuterRisk(forecastList);
  }, [forecastList]);

  if (!riskData) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Extreme":
        return "text-destructive font-bold"; // Uses PH Red
      case "High":
        return "text-destructive/80 font-semibold";
      case "Moderate":
        return "text-secondary font-bold drop-shadow-sm"; // Uses PH Yellow
      default:
        return "text-primary dark:text-primary-foreground font-medium"; // Uses PH Blue
    }
  };

  const renderIcon = (factor: string) => {
    if (factor.includes("Rain")) return <CloudRain className="w-5 h-5" />;
    if (factor.includes("Wind")) return <Wind className="w-5 h-5" />;
    if (factor.includes("Heat")) return <Sun className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  return (
    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-none bg-transparent h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium tracking-tight text-neutral-500 uppercase">
          Suspension Probability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-3xl font-semibold tracking-tighter">
              {riskData.probability}%
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-sm font-medium ${getRiskColor(riskData.riskLevel)}`}
              >
                {riskData.riskLevel} Risk
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end opacity-75">
            {renderIcon(riskData.primaryFactor)}
            <span className="text-xs text-neutral-500 mt-1">
              {riskData.primaryFactor}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
