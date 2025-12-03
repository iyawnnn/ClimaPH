type WeatherDisplayProps = {
  weather: any;
  error: string;
};

export default function WeatherDisplay({
  weather,
  error,
}: WeatherDisplayProps) {
  if (error) return <p className="text-red-600 mt-3">{error}</p>;

  if (!weather) return null;

  return (
    <div className="mt-4 border rounded p-3">
      <h3 className="font-bold">{weather.displayName}</h3>
      <p className="capitalize">{weather.weather?.[0]?.description}</p>
      <p className="text-lg">{Math.round(weather.main?.temp)}°C</p>
      <p className="text-sm text-muted-foreground">
        Humidity: {weather.main?.humidity}% • Wind: {weather.wind?.speed} m/s
      </p>
    </div>
  );
}
