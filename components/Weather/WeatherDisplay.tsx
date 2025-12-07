import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type WeatherDisplayProps = {
  weather: any;
  error: string;
  loading?: boolean;
  unit: "C" | "F";
};

// helper
const convertTemp = (tempC: number, unit: "C" | "F") =>
  unit === "C" ? tempC : tempC * 9 / 5 + 32;

export default function WeatherDisplay({ weather, error, loading, unit }: WeatherDisplayProps) {
  if (error) return <p className="text-red-600 mt-3 text-center">{error}</p>;
  
  if (loading && !weather) return (
    <Card className="mt-4 p-4 flex flex-col items-center gap-2">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-4 w-52" />
    </Card>
  );

  if (!weather) return null;

  return (
    <Card className="mt-4 p-4 flex flex-col items-center gap-2">
      <h3 className="font-bold text-lg text-foreground">{weather.displayName}</h3>
      <p className="capitalize text-foreground text-sm">
        {weather.weather?.[0]?.description?.charAt(0).toUpperCase() + weather.weather?.[0]?.description?.slice(1)}
      </p>
      <p className="text-2xl font-semibold text-foreground">
        {Math.round(convertTemp(weather.main?.temp, unit))}°{unit}
      </p>
      <p className="text-sm text-muted-foreground">
        Humidity: {weather.main?.humidity}% • Wind: {weather.wind?.speed} m/s
      </p>
    </Card>
  );
}
