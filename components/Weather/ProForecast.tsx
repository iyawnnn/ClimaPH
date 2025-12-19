"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Cloud, CloudRain, Sun, CloudSnow, CloudLightning, Info } from "lucide-react";
import ForecastChart from "./ForecastChart";

type ProForecastProps = {
  fiveDay: any; 
  twelveHour: any[];
  unit: "C" | "F";
  loading: boolean;
};

const getWeatherIcon = (condition: string) => {
  const c = condition?.toLowerCase() || "";
  if (c.includes("rain") || c.includes("drizzle")) return <CloudRain className="w-8 h-8 text-blue-500" />;
  if (c.includes("storm") || c.includes("thunder")) return <CloudLightning className="w-8 h-8 text-yellow-500" />;
  if (c.includes("snow")) return <CloudSnow className="w-8 h-8 text-cyan-200" />;
  if (c.includes("cloud")) return <Cloud className="w-8 h-8 text-slate-400" />;
  return <Sun className="w-8 h-8 text-yellow-500" />;
};

const processDailyData = (input: any, unit: "C" | "F") => {
  if (!input) return [];

  // Robust check for array or object.list
  const list = Array.isArray(input) ? input : (input?.list || []);

  if (!Array.isArray(list) || list.length === 0) return [];

  const dailyMap = new Map();

  list.forEach((item: any) => {
    if (!item || !item.dt || !item.weather || !item.weather[0]) return;
    
    const dateObj = new Date(item.dt * 1000);
    const dateKey = dateObj.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: dateKey,
        temps: [],
        conditions: [],
      });
    }

    const entry = dailyMap.get(dateKey);
    const val = unit === "C" ? item.main.temp : (item.main.temp * 9) / 5 + 32;
    entry.temps.push(val);
    entry.conditions.push(item.weather[0].main);
  });

  return Array.from(dailyMap.values()).map((day: any) => {
    const min = Math.min(...day.temps);
    const max = Math.max(...day.temps);
    
    const condition = day.conditions.sort((a:string,b:string) =>
      day.conditions.filter((v:string) => v===a).length - day.conditions.filter((v:string) => v===b).length
    ).pop();

    return {
      date: day.date,
      min: Math.round(min),
      max: Math.round(max),
      condition: condition || "Clear",
    };
  }).slice(0, 5);
};

export default function ProForecast({ fiveDay, twelveHour, unit, loading }: ProForecastProps) {
  const [tab, setTab] = useState("hourly");
  
  // Wait for data to be ready
  const dailyData = processDailyData(fiveDay, unit);

  if (loading) {
    return <Card className="h-[300px] w-full animate-pulse bg-muted/50 border-none rounded-xl" />;
  }

  if (!dailyData.length && (!twelveHour || twelveHour.length === 0)) {
     return null;
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <Tabs defaultValue="hourly" className="w-full" onValueChange={setTab}>
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold tracking-tight">Extended Forecast</h3>
            <TabsList className="bg-muted/50 w-full sm:w-auto grid grid-cols-2 sm:flex">
                <TabsTrigger value="hourly" className="text-xs px-4">Hourly Trend</TabsTrigger>
                <TabsTrigger value="daily" className="text-xs px-4">5-Day Outlook</TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="hourly" className="mt-0">
             {twelveHour && twelveHour.length > 0 ? (
                <ForecastChart data={twelveHour} unit={unit} />
             ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm border rounded-xl border-dashed">
                   No hourly data available
                </div>
             )}
        </TabsContent>

        <TabsContent value="daily" className="mt-0">
            {/* MOBILE: Flex + Overflow-X (Carousel) 
               DESKTOP: Grid (Clean Layout)
            */}
            <div className="flex overflow-x-auto pb-4 gap-4 md:grid md:grid-cols-5 md:overflow-visible snap-x">
                {dailyData.length > 0 ? (
                    dailyData.map((day, i) => (
                        <Card key={day.date} className="min-w-[140px] md:min-w-0 border bg-card/50 hover:bg-card transition-colors flex flex-col justify-center group snap-center">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-3">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide group-hover:text-foreground transition-colors">
                                    {i === 0 ? "Today" : day.date}
                                </p>
                                <div className="p-2 bg-muted/50 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    {getWeatherIcon(day.condition)}
                                </div>
                                
                                {/* TEMPS WITH TOOLTIPS */}
                                <TooltipProvider delayDuration={0}>
                                  <div className="flex flex-col items-center gap-0.5">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="text-2xl font-bold tracking-tight cursor-help hover:text-blue-500 transition-colors">
                                            {day.max}°
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                          <p className="text-xs">Predicted High</p>
                                        </TooltipContent>
                                      </Tooltip>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="text-sm font-medium text-muted-foreground cursor-help hover:text-blue-400 transition-colors">
                                            {day.min}°
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                          <p className="text-xs">Predicted Low</p>
                                        </TooltipContent>
                                      </Tooltip>
                                  </div>
                                </TooltipProvider>

                                <p className="text-[10px] font-medium text-muted-foreground truncate w-full px-1 bg-muted/30 rounded py-0.5 mt-1 capitalize">
                                    {day.condition}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full h-[200px] flex items-center justify-center text-muted-foreground text-sm border rounded-xl border-dashed w-full">
                        No daily forecast data available.
                    </div>
                )}
            </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}