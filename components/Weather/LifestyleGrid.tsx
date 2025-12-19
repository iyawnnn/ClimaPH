import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Thermometer, Shirt, Droplets, Umbrella, Info } from "lucide-react";

type LifestyleGridProps = {
  weather: any;
  unit: "C" | "F";
};

// Helper for consistency
const InfoHeader = ({ title, icon: Icon, tooltip }: { title: string; icon: any; tooltip: string }) => (
  <div className="flex items-center justify-between w-full mb-2">
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help p-0.5 rounded-full hover:bg-muted transition-colors opacity-50 hover:opacity-100">
              <Info className="w-3 h-3 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-[200px] text-xs">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <Icon className="w-4 h-4 text-muted-foreground" />
  </div>
);

export default function LifestyleGrid({ weather, unit }: LifestyleGridProps) {
  if (!weather) return null;

  const feelsLike = Math.round(
    unit === "C"
      ? weather.main.feels_like
      : (weather.main.feels_like * 9) / 5 + 32
  );

  const dewPoint = Math.round(
      unit === "C" 
      ? weather.main.temp - ((100 - weather.main.humidity) / 5) 
      : (weather.main.temp - ((100 - weather.main.humidity) / 5) * 9/5 + 32)
  );

  const isRaining = weather.weather.some((c: any) =>
    c.main.toLowerCase().includes("rain") || c.main.toLowerCase().includes("drizzle")
  );
  const isCloudy = weather.clouds.all > 70;

  // --- LOGIC: Real Feel Status & Color ---
  let feelStatus = "Comfortable";
  let feelColor = "text-green-500";

  if (feelsLike >= 36) {
      feelStatus = "Extreme Caution";
      feelColor = "text-red-600 font-bold"; // Dark Red for Extreme
  } else if (feelsLike >= 31) {
      feelStatus = "Hot";
      feelColor = "text-red-500"; // Red for Hot
  } else if (feelsLike >= 26) {
      feelStatus = "Warm";
      feelColor = "text-orange-500"; // Orange for Warm
  } else if (feelsLike < 20) {
      feelStatus = "Cool";
      feelColor = "text-blue-500"; // Blue for Cool
  }
  
  // Logic: Laundry Guide
  let laundryStatus = "Great Time!";
  let laundryDesc = "Sunny & clear. Dry clothes fast.";
  let laundryColor = "text-green-500";

  if (isRaining) {
    laundryStatus = "Don't Risk It.";
    laundryDesc = "Rain is expected. Keep it inside.";
    laundryColor = "text-red-500";
  } else if (isCloudy) {
    laundryStatus = "Decent.";
    laundryDesc = "Might take longer to dry.";
    laundryColor = "text-yellow-500";
  }

  // Logic: Umbrella Check
  let umbrellaStatus = "No Need.";
  let umbrellaDesc = "Clear skies ahead.";
  let umbrellaColor = "text-muted-foreground";

  if (isRaining) {
    umbrellaStatus = "Bring Umbrella!";
    umbrellaDesc = "Rain is likely. Stay dry.";
    umbrellaColor = "text-blue-500";
  } else if (weather.clouds.all > 50) {
     umbrellaStatus = "Just in Case.";
     umbrellaDesc = "Cloudy skies, chance of rain.";
     umbrellaColor = "text-blue-400";
  } else if (weather.main.temp > 32) {
      umbrellaStatus = "Use for Sun.";
      umbrellaDesc = "UV is high. Shield yourself.";
      umbrellaColor = "text-orange-500";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* CARD 1: Real Feel */}
      <Card>
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <InfoHeader 
            title="Real Feel" 
            icon={Thermometer} 
            tooltip="Calculates how the temperature actually feels based on humidity and wind."
          />
          <div>
            <div className="text-2xl font-bold">
              {feelsLike}°{unit}
            </div>
            {/* FIX: Now using variables guaranteed to match */}
            <p className={`text-xs font-medium mt-1 ${feelColor}`}>
              {feelStatus}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: Laundry Guide */}
      <Card>
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <InfoHeader 
            title="Laundry Guide" 
            icon={Shirt} 
            tooltip="Advice on drying clothes based on rain probability and sunlight."
          />
          <div>
            <div className={`text-2xl font-bold ${laundryColor}`}>
              {laundryStatus}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1" title={laundryDesc}>
              {laundryDesc}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CARD 3: Humidity */}
      <Card>
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <InfoHeader 
            title="Humidity" 
            icon={Droplets} 
            tooltip="The amount of water vapor in the air. High humidity makes it feel hotter."
          />
          <div>
            <div className="text-2xl font-bold">
              {weather.main.humidity}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dew point: {dewPoint}°
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CARD 4: Umbrella Check */}
      <Card>
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <InfoHeader 
            title="Umbrella Check" 
            icon={Umbrella} 
            tooltip="Recommendation on whether you need an umbrella for rain or intense sun."
          />
          <div>
            <div className={`text-2xl font-bold ${umbrellaColor}`}>
              {umbrellaStatus}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 capitalize" title={isRaining ? "Light rain expected" : weather.weather[0].description}>
               {isRaining ? "Light rain expected" : weather.weather[0].description}
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}