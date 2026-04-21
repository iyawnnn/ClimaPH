"use client";

import { useWeather } from "@/hooks/useWeather";
import { useAppStore } from "@/store/useAppStore";
import { CartesianGrid, Line, LineChart, XAxis, LabelList } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Cloud, CloudRain, Sun, CloudLightning, Moon } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  temp: {
    label: "Temperature",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export default function ForecastCarousel() {
  const { fiveDayForecast, loadingWeather } = useWeather();
  const { unit } = useAppStore();

  if (loadingWeather || !fiveDayForecast) {
    return <Skeleton className="w-full h-[220px] rounded-3xl bg-transparent" />;
  }

  const chartData: any[] = [];
  const seenPeriods = new Set();

  for (const item of fiveDayForecast) {
    const date = new Date(item.dt * 1000);
    const hour = date.getHours();
    
    let period = "";
    if (hour >= 5 && hour < 12) period = "Morning";
    else if (hour >= 12 && hour < 17) period = "Afternoon";
    else if (hour >= 17 && hour < 21) period = "Evening";
    else period = "Night";

    if (!seenPeriods.has(period)) {
      seenPeriods.add(period);
      
      const rawTemp = item.main.temp;
      const displayTemp = unit === "C" ? Math.round(rawTemp) : Math.round((rawTemp * 9) / 5 + 32);

      chartData.push({ 
        period, 
        temp: displayTemp,
        displayLabel: `${displayTemp}°`,
        description: item.weather?.[0]?.description || "clear"
      });
    }

    if (chartData.length === 4) break;
  }

  const CustomIconLabel = (props: any) => {
    const { x, y, index } = props;
    const dataPoint = chartData[index];
    if (!dataPoint) return null;

    const desc = (dataPoint.description || "").toLowerCase();
    const period = dataPoint.period;

    let Icon = Sun;
    let colorClass = "text-amber-500 dark:text-amber-400";

    if (desc.includes("rain") || desc.includes("drizzle")) {
      Icon = CloudRain;
      colorClass = "text-blue-500 dark:text-blue-400";
    } else if (desc.includes("thunder") || desc.includes("storm")) {
      Icon = CloudLightning;
      colorClass = "text-purple-500 dark:text-purple-400";
    } else if (desc.includes("cloud")) {
      Icon = Cloud;
      colorClass = "text-neutral-400 dark:text-neutral-500";
    } else if (period === "Night" || period === "Evening") {
      Icon = Moon;
      colorClass = "text-indigo-400 dark:text-indigo-500";
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <Icon 
          x={-14} 
          y={-32} 
          width={28} 
          height={28} 
          className={`${colorClass} drop-shadow-sm transition-colors duration-300`} 
          strokeWidth={2.5} 
        />
      </g>
    );
  };

  return (
    <div className="flex flex-col w-full h-full justify-center pt-2">
      <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-6">
        How's the temperature today?
      </h2>

      <div className="w-full h-[220px]">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            overflow="visible" 
            margin={{
              top: 40,
              left: 24,
              right: 24,
              bottom: 0, 
            }}
          >
            <CartesianGrid 
              vertical={true} 
              horizontal={false} 
              stroke="var(--border)" 
              strokeOpacity={0.6} 
              strokeDasharray="4 4" 
            />
            
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              interval={0}
              height={60} 
              tick={({ x, y, payload }) => {
                const dataPoint = chartData.find(d => d.period === payload.value);
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text 
                      x={0} 
                      y={18} 
                      textAnchor="middle" 
                      className="fill-foreground text-2xl font-bold font-sans tracking-tighter"
                    >
                      {dataPoint?.displayLabel}
                    </text>
                    <text 
                      x={0} 
                      y={38} 
                      textAnchor="middle" 
                      dominantBaseline="hanging" 
                      className="fill-muted-foreground text-[11px] font-bold uppercase tracking-widest font-sans"
                    >
                      {payload.value}
                    </text>
                  </g>
                );
              }}
            />
            
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  nameKey="temp"
                  hideLabel
                />
              }
            />
            
            <Line
              dataKey="temp"
              type="natural"
              stroke="var(--color-temp)"
              strokeWidth={4}
              dot={{
                fill: "var(--background)",
                stroke: "var(--color-temp)",
                strokeWidth: 3,
                r: 6,
              }}
              activeDot={{
                r: 8,
                fill: "var(--color-temp)",
                stroke: "var(--background)",
                strokeWidth: 3,
              }}
            >
              <LabelList content={<CustomIconLabel />} />
            </Line>
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}