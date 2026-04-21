"use client";

import { useWeather } from "@/hooks/useWeather";
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";
import { Activity } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  temp: {
    label: "Temperature",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function ForecastCarousel() {
  const { twelveHourForecast, loadingWeather } = useWeather();

  if (loadingWeather || !twelveHourForecast) {
    return <Skeleton className="w-full h-full min-h-[250px] rounded-[2rem] bg-muted/20 border-none" />;
  }

  const chartData = twelveHourForecast.map((item) => {
    const date = new Date(item.dt * 1000);
    const timeString = date.toLocaleTimeString([], { hour: "numeric" });
    return {
      time: item.isCurrent ? "Now" : timeString,
      temp: Math.round(item.main.temp),
    };
  });

  const currentTemp = chartData[0]?.temp || 0;
  const lastTemp = chartData[chartData.length - 1]?.temp || 0;
  const tempDiff = lastTemp - currentTemp;
  
  let trendText = "Temperature remaining stable";
  if (tempDiff > 0) {
    trendText = `Warming up by ${tempDiff}°C`;
  } else if (tempDiff < 0) {
    trendText = `Cooling down by ${Math.abs(tempDiff)}°C`;
  }

  return (
    <div className="flex flex-col w-full h-full justify-between">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold tracking-tight text-foreground font-sans">
          12-Hour Trajectory
        </h2>
        <p className="text-sm text-muted-foreground font-sans mt-1">
          Temperature projection for the upcoming hours
        </p>
      </div>

      <div className="w-full h-[140px] my-auto">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 24,
              left: 12,
              right: 12,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              fontSize={12}
              className="font-sans font-medium fill-muted-foreground"
            />
            <ChartTooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "4 4" }}
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
              type="monotone"
              stroke="var(--color-temp)"
              strokeWidth={3}
              dot={{
                fill: "var(--background)",
                stroke: "var(--color-temp)",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                fill: "var(--color-temp)",
                stroke: "var(--background)",
                strokeWidth: 2,
                r: 6,
              }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground font-sans font-semibold"
                fontSize={12}
                dataKey="temp"
                formatter={(value: number) => `${value}°`}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </div>
      
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground font-sans">
        <Activity className="h-4 w-4 text-[#0032A0]" />
        <span>{trendText} over the next 12 hours.</span>
      </div>
    </div>
  );
}