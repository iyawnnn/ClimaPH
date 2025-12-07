import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ForecastProps = {
  forecast: any;
  type: "5-day" | "12-hour";
  loading?: boolean;
  unit: "C" | "F";
};

const convertTemp = (tempC: number, unit: "C" | "F") =>
  unit === "C" ? tempC : (tempC * 9) / 5 + 32;

export default function Forecast({
  forecast,
  type,
  loading,
  unit,
}: ForecastProps) {
  if (loading && !forecast) {
    return (
      <div className="mt-4 space-y-2">
        {Array.from({ length: type === "5-day" ? 5 : 4 }).map((_, i) => (
          <Card
            key={i}
            className="p-3 flex flex-col items-center gap-1 text-center"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (!forecast) return null;

  return (
    <div className="mt-4 space-y-2">
      {/* 5-day forecast */}
      {type === "5-day" &&
        !Array.isArray(forecast) &&
        Object.entries(forecast).map(([date, { high, low, description }]) => (
          <Card
            key={date}
            className="p-3 flex flex-col items-center gap-1 text-center"
          >
            <p className="font-semibold text-sm text-foreground">{date}</p>
            <p className="text-sm text-muted-foreground">
              {description.charAt(0).toUpperCase() + description.slice(1)} •
              <span className="font-semibold ml-1">
                High: {Math.round(convertTemp(high, unit))}°{unit}
              </span>{" "}
              •
              <span className="font-semibold ml-1">
                Low: {Math.round(convertTemp(low, unit))}°{unit}
              </span>
            </p>
          </Card>
        ))}

      {/* 12-hour forecast */}
      {type === "12-hour" &&
        Array.isArray(forecast) &&
        forecast.map((item: any, index: number) => {
          const localDate = new Date(item.localDt);
          const dateStr = localDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
          const timeStr = localDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <Card
              key={index}
              className="p-3 flex flex-col items-center gap-1 text-center"
            >
              <p className="font-semibold text-sm text-foreground">
                {dateStr} {timeStr}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.weather[0].description.charAt(0).toUpperCase() +
                  item.weather[0].description.slice(1)}{" "}
                •
                <span className="font-semibold ml-1">
                  {Math.round(convertTemp(item.main.temp, unit))}°{unit}
                </span>
              </p>
            </Card>
          );
        })}
    </div>
  );
}
