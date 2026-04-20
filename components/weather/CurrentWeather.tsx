import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Droplets, Wind, MapPin, Info } from "lucide-react";
import { Suggestion } from "@/types/types";

type CurrentWeatherProps = {
  weather: any;
  loading: boolean;
  unit: "C" | "F";
  favorites: Suggestion[];
  toggleFavorite: (loc: Suggestion) => void;
};

// HELPER: Reusable Info Label with Tooltip
const InfoLabel = ({
  label,
  tooltipText,
}: {
  label: string;
  tooltipText: string;
}) => (
  <div className="flex items-center gap-1.5 mb-1">
    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
      {label}
    </span>
    {/* Local TooltipProvider ensures it works even if not in global layout */}
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* FIX: Removed opacity/40, made cursor help, added hover effect */}
          <div className="cursor-help p-0.5 rounded-full hover:bg-muted transition-colors">
            <Info className="w-3 h-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[200px] text-xs font-medium"
        >
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

export default function CurrentWeather({
  weather,
  loading,
  unit,
  favorites,
  toggleFavorite,
}: CurrentWeatherProps) {
  if (loading || !weather) {
    return (
      <Card className="h-[400px] w-full animate-pulse bg-muted rounded-xl border" />
    );
  }

  const temp = Math.round(
    unit === "C" ? weather.main.temp : (weather.main.temp * 9) / 5 + 32
  );
  const feelsLike = Math.round(
    unit === "C"
      ? weather.main.feels_like
      : (weather.main.feels_like * 9) / 5 + 32
  );

  const isFavorite = favorites.some((f) => f.display === weather.displayName);

  return (
    <Card className="h-[400px] flex flex-col relative shadow-sm border bg-card text-card-foreground overflow-hidden group">
      {/* Background Decoration */}
      <div className="absolute -top-12 -right-12 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110 duration-700">
        <MapPin className="w-64 h-64" />
      </div>

      {/* HEADER */}
      <CardHeader className="relative z-10 px-6 pt-5 pb-0 shrink-0">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle
              className="text-xl md:text-2xl font-bold leading-tight break-words pr-1 line-clamp-4"
              title={weather.displayName}
            >
              {weather.displayName}
            </CardTitle>

            <p className="text-sm text-muted-foreground capitalize font-medium">
              {weather.weather[0].description}
            </p>
          </div>

          <button
            onClick={() =>
              toggleFavorite({
                display: weather.displayName,
                lat: weather.coord.lat,
                lng: weather.coord.lon,
              })
            }
            className="p-2 shrink-0 rounded-full hover:bg-muted/80 transition-all active:scale-95 border border-transparent hover:border-border mt-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isFavorite ? "gold" : "none"}
              stroke="currentColor"
              className={`w-5 h-5 ${isFavorite ? "text-yellow-500" : "text-muted-foreground"}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        </div>
      </CardHeader>

      {/* MAIN CONTENT */}
      <CardContent className="relative z-10 flex-grow flex flex-col justify-end px-6 pb-5 gap-8">
        {/* Temp & Status Block */}
        <div className="flex items-end justify-between w-full">
          <div className="flex items-start">
            <span className="text-7xl font-bold tracking-tighter leading-none">
              {temp}
            </span>
            <span className="text-3xl font-light text-muted-foreground mt-1.5 ml-1">
              °{unit}
            </span>
          </div>

          <div className="flex flex-col items-end mb-1.5 gap-2">
            {temp > 30 ? (
              <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border border-orange-500/20">
                Hot
              </span>
            ) : temp < 20 ? (
              <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border border-blue-500/20">
                Cool
              </span>
            ) : (
              <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border border-green-500/20">
                Comfy
              </span>
            )}
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Feels like {feelsLike}°
            </span>
          </div>
        </div>

        <div className="h-px w-full bg-border/60" />

        {/* Bottom Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Humidity Card */}
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
            {/* FIX: Darker border and solid background for visibility */}
            <div className="h-10 w-10 rounded-full bg-blue-50/50 dark:bg-blue-900/10 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
              <Droplets className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="flex flex-col justify-center">
              <InfoLabel
                label="Humidity"
                tooltipText="The concentration of water vapor present in the air."
              />
              <p className="text-lg font-extrabold leading-none tracking-tight">
                {weather.main.humidity}%
              </p>
            </div>
          </div>

          {/* Wind Card */}
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
            {/* FIX: Darker border and solid background for visibility */}
            <div className="h-10 w-10 rounded-full bg-teal-50/50 dark:bg-teal-900/10 flex items-center justify-center shrink-0 border border-teal-200 dark:border-teal-800">
              <Wind className="w-5 h-5 text-teal-500 dark:text-teal-400" />
            </div>
            <div className="flex flex-col justify-center">
              <InfoLabel
                label="Wind"
                tooltipText="The current speed of wind in meters per second."
              />
              <p className="text-lg font-extrabold leading-none tracking-tight flex items-baseline gap-1">
                {weather.wind.speed}{" "}
                <span className="text-sm font-bold text-muted-foreground">
                  m/s
                </span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
