"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type ForecastChartProps = {
  data: any[];
  unit: "C" | "F";
};

const chartConfig = {
  temp: {
    label: "Temperature",
    color: "var(--chart-1)", 
  },
} satisfies ChartConfig;

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
  });
};

const interpolateData = (data: any[], unit: "C" | "F") => {
  if (!data || data.length < 2) return [];

  const hourlyData = [];
  const now = new Date();
  const currentHourStart = new Date(now.setMinutes(0, 0, 0)).getTime();

  for (let i = 0; i < data.length - 1; i++) {
    const current = data[i];
    const next = data[i + 1];

    const currentTemp = unit === "C" ? current.main.temp : (current.main.temp * 9) / 5 + 32;
    const nextTemp = unit === "C" ? next.main.temp : (next.main.temp * 9) / 5 + 32;

    const timeStart = current.dt * 1000;
    const timeEnd = next.dt * 1000;
    const duration = timeEnd - timeStart;

    if (duration <= 0) continue;
    const steps = Math.floor(duration / (1000 * 60 * 60)); 
    const totalSteps = steps > 0 ? steps : 1; 

    for (let j = 0; j < totalSteps; j++) {
      const fraction = j / totalSteps;
      const estimatedTime = timeStart + (duration * fraction);

      if (estimatedTime >= currentHourStart - (1000 * 60 * 60)) {
         const timeStr = formatTime(new Date(estimatedTime));
         const exists = hourlyData.find(d => d.timeLabel === timeStr);
         if (!exists) {
           hourlyData.push({
              timeLabel: timeStr,
              fullDate: estimatedTime, 
              temp: Math.round(currentTemp + (nextTemp - currentTemp) * fraction),
           });
         }
      }
    }
  }

  return hourlyData
    .sort((a, b) => a.fullDate - b.fullDate)
    .filter(d => d.fullDate >= currentHourStart)
    .slice(0, 12);
};

export default function ForecastChart({ data, unit }: ForecastChartProps) {
  const chartData = interpolateData(data, unit);
  
  const temps = chartData.map((d) => d.temp);
  const minTemp = Math.min(...temps, 100) - 2;
  const maxTemp = Math.max(...temps, -100) + 2;

  const rangeText = chartData.length > 0 
    ? `${chartData[0]?.timeLabel} - ${chartData[chartData.length - 1]?.timeLabel}` 
    : "Next 12 Hours";

  return (
    // FIX: Removed 'border-none shadow-none' to bring back the card look
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Temperature Trend</CardTitle>
        <CardDescription>
          Hourly forecast for the next 12 hours
        </CardDescription>
      </CardHeader>
      
      {/* FIX: Removed 'px-0' so the chart has breathing room inside the border */}
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} opacity={0.2} />
            
            <XAxis
              dataKey="timeLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStart"
              minTickGap={15} 
              fontSize={10} 
            />
            
            <YAxis hide domain={[minTemp, maxTemp]} />
            
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value) => (
                    <div className="flex min-w-[120px] items-center text-xs text-muted-foreground">
                      Temperature
                      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground">
                        {value}
                        <span className="font-normal text-muted-foreground">°{unit}</span>
                      </div>
                    </div>
                  )}
                />
              }
            />
            
            <Area
              dataKey="temp"
              type="natural"
              fill="url(#fillTemp)" 
              fillOpacity={0.4}
              stroke="var(--chart-1)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Weather Trend <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {rangeText}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}