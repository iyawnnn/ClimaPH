"use client";

import { useWeather } from "@/hooks/useWeather";
import { useAppStore } from "@/store/useAppStore";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function ForecastChart() {
  const { twelveHourForecast, loadingWeather } = useWeather();
  const { unit } = useAppStore();

  if (loadingWeather || !twelveHourForecast) {
    return <Skeleton className="w-full h-full rounded-2xl bg-muted/20 border border-border/30" />;
  }

  if (twelveHourForecast.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No chart data available.</div>;
  }

  // Format data for the chart
  const chartData = twelveHourForecast.slice(0, 8).map((info: any) => {
    const dateObj = new Date(info.dt * 1000);
    const timeString = info.isCurrent ? "Now" : dateObj.toLocaleTimeString([], { hour: 'numeric' });
    const rawTemp = info.main?.temp ?? 0;
    const temp = unit === "C" ? Math.round(rawTemp) : Math.round((rawTemp * 9) / 5 + 32);

    return { time: timeString, temp };
  });

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-sans">Temperature Trend</h3>
        <span className="text-xs font-medium text-foreground bg-muted/50 px-2 py-1 rounded-md">Next 24h</span>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
              dy={10}
            />
            <YAxis 
              hide={true} 
              domain={['dataMin - 2', 'dataMax + 2']} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
              itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
              formatter={(value: number) => [`${value}°${unit}`, 'Temp']}
            />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#tempGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}