"use client";

import { useWeather } from "@/hooks/useWeather";
import { useAppStore } from "@/store/useAppStore";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  LabelList,
  YAxis,
  ReferenceLine,
} from "recharts";
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
    return <Skeleton className="w-full h-[280px] rounded-3xl bg-transparent" />;
  }

  const dailyOrder = ["Morning", "Afternoon", "Evening", "Night"];
  const periodMap = new Map();

  for (const item of fiveDayForecast) {
    const date = new Date(item.dt * 1000);
    const hour = date.getHours();

    let period = "";
    if (hour >= 5 && hour < 12) period = "Morning";
    else if (hour >= 12 && hour < 17) period = "Afternoon";
    else if (hour >= 17 && hour < 21) period = "Evening";
    else period = "Night";

    if (!periodMap.has(period)) {
      const rawTemp = item.main.temp;
      const displayTemp =
        unit === "C" ? Math.round(rawTemp) : Math.round((rawTemp * 9) / 5 + 32);

      periodMap.set(period, {
        period,
        temp: displayTemp,
        displayLabel: `${displayTemp}°`,
        description: item.weather?.[0]?.description || "clear",
        isGhost: false,
      });
    }
    if (periodMap.size === 4) break;
  }

  const realData = dailyOrder.map((p, index) => ({
    ...periodMap.get(p),
    x: index,
  }));

  const offset = 0.2;
  const chartData = [
    { x: -offset, temp: realData[0]?.temp, isGhost: true },
    ...realData,
    { x: 3 + offset, temp: realData[realData.length - 1]?.temp, isGhost: true },
  ];

  const CustomIconLabel = (props: any) => {
    const { x, y, index } = props;
    const dataPoint = chartData[index];
    if (!dataPoint || dataPoint.isGhost) return null;

    const desc = (dataPoint.description || "").toLowerCase();
    const period = dataPoint.period;

    let Icon = Sun;
    let colorClass = "text-amber-500 dark:text-amber-400";
    let bgClass = "fill-amber-500/10 dark:fill-amber-400/10";

    if (desc.includes("rain") || desc.includes("drizzle")) {
      Icon = CloudRain;
      colorClass = "text-blue-500 dark:text-blue-400";
      bgClass = "fill-blue-500/10 dark:fill-blue-400/10";
    } else if (desc.includes("thunder") || desc.includes("storm")) {
      Icon = CloudLightning;
      colorClass = "text-purple-500 dark:text-purple-400";
      bgClass = "fill-purple-500/10 dark:fill-purple-400/10";
    } else if (desc.includes("cloud")) {
      Icon = Cloud;
      colorClass = "text-neutral-400 dark:text-neutral-500";
      bgClass = "fill-neutral-400/10 dark:fill-neutral-500/10";
    } else if (period === "Night" || period === "Evening") {
      Icon = Moon;
      colorClass = "text-indigo-400 dark:text-indigo-500";
      bgClass = "fill-indigo-400/10 dark:fill-indigo-500/10";
    }

    return (
      <g key={`icon-group-${index}`} transform={`translate(${x},${y})`}>
        <circle
          cx={0}
          cy={-45}
          r={22}
          className={`${bgClass} transition-colors duration-300`}
        />
        <Icon
          x={-14}
          y={-59}
          width={28}
          height={28}
          className={`${colorClass} drop-shadow-sm`}
          strokeWidth={2.5}
        />
      </g>
    );
  };

  return (
    <div className="flex flex-col w-full h-full justify-center pt-4 overflow-hidden">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
        How's the temperature today?
      </h2>

      <div className="w-full h-[260px] md:h-[280px]">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            style={{ overflow: "visible" }}
            margin={{ top: 90, left: 10, right: 10, bottom: 0 }}
          >
            <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
            <CartesianGrid vertical={false} horizontal={false} />

            <ReferenceLine
              x={0.5}
              stroke="var(--muted-foreground)"
              strokeOpacity={0.8}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <ReferenceLine
              x={1.5}
              stroke="var(--muted-foreground)"
              strokeOpacity={0.8}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <ReferenceLine
              x={2.5}
              stroke="var(--muted-foreground)"
              strokeOpacity={0.8}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />

            <XAxis
              type="number"
              dataKey="x"
              domain={[-0.5, 3.5]}
              tickLine={false}
              axisLine={false}
              interval={0}
              height={70}
              ticks={[0, 1, 2, 3]}
              tick={({ x, y, payload }: any) => {
                const dataPoint = realData[payload.value];

                if (!dataPoint) return <g />;

                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={20}
                      textAnchor="middle"
                      className="fill-foreground text-xl md:text-2xl font-bold tracking-tighter"
                    >
                      {dataPoint.displayLabel}
                    </text>
                    <text
                      x={0}
                      y={42}
                      textAnchor="middle"
                      dominantBaseline="hanging"
                      className="fill-muted-foreground text-[8px] md:text-[11px] font-bold uppercase tracking-widest"
                    >
                      {dataPoint.period}
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
              dot={(props: any) => {
                const { cx, cy, payload, index } = props;
                if (payload.isGhost) return <g key={`ghost-dot-${index}`} />;
                return (
                  <circle
                    key={`dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill="var(--background)"
                    stroke="var(--color-temp)"
                    strokeWidth={3}
                  />
                );
              }}
              activeDot={(props: any) => {
                const { cx, cy, payload, index } = props;
                if (payload.isGhost) return <g key={`ghost-active-${index}`} />;
                return (
                  <circle
                    key={`active-dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={8}
                    fill="var(--color-temp)"
                    stroke="var(--background)"
                    strokeWidth={3}
                  />
                );
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