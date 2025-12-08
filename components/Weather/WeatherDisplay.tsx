import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Suggestion } from "@/types/types";
import { Star } from "lucide-react";

type WeatherDisplayProps = {
  weather: any;
  error: string;
  loading?: boolean;
  unit: "C" | "F";
  favorites?: Suggestion[];
  toggleFavorite?: (loc: Suggestion) => void;
};

// Helper to convert temperature
const convertTemp = (tempC: number, unit: "C" | "F") =>
  unit === "C" ? tempC : tempC * 9 / 5 + 32;

export default function WeatherDisplay({
  weather,
  error,
  loading,
  unit,
  favorites,
  toggleFavorite,
}: WeatherDisplayProps) {
  if (error) return <p className="text-red-600 mt-3 text-center">{error}</p>;

  if (loading && !weather)
    return (
      <Card className="mt-4 p-4 flex flex-col items-center gap-2 relative">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-52" />
      </Card>
    );

  if (!weather) return null;

  const isFav = favorites?.some((f) => f.display === weather.displayName);

  return (
    <Card className="mt-4 p-4 flex flex-col items-center gap-2 relative">
      {/* Favorite button */}
      {toggleFavorite && (
        <Button
          size="icon"
          variant="outline"
          className={`absolute top-2 right-2 p-1 ${isFav ? "text-yellow-500" : "text-foreground"}`}
          onClick={() =>
            toggleFavorite({
              display: weather.displayName,
              lat: weather.coord.lat,
              lng: weather.coord.lon,
            })
          }
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className="w-5 h-5" />
        </Button>
      )}

      <h3 className="font-bold text-lg text-foreground">{weather.displayName}</h3>
      <p className="capitalize text-foreground text-sm">
        {weather.weather?.[0]?.description?.charAt(0).toUpperCase() +
          weather.weather?.[0]?.description?.slice(1)}
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
