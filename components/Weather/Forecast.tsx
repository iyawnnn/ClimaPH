type ForecastProps = {
  forecast: any;
  type: "5-day" | "12-hour";
};

export default function Forecast({ forecast, type }: ForecastProps) {
  // Avoid displaying loading message if forecast data hasn't been fetched yet
  if (forecast === null) {
    return null; // Don't display anything when there's no forecast data (initial state)
  }

  // Show loading message while waiting for forecast data
  if (forecast === undefined) {
    return <p className="text-center">Loading forecast...</p>;
  }

  if (type === "12-hour" && Array.isArray(forecast) && forecast.length === 0) {
    return <p className="text-center">No 12-hour forecast data available.</p>;
  }

  if (
    type === "5-day" &&
    (!forecast ||
      (typeof forecast === "object" && Object.keys(forecast).length === 0))
  ) {
    return <p className="text-center">No 5-day forecast data available.</p>;
  }

  return (
    <div className="mt-4">
      {type === "5-day" && !Array.isArray(forecast)
        ? Object.entries(forecast).map(([date, { high, low, description }]) => (
            <div key={date} className="mb-3">
              <p className="font-bold">{date}</p>
              <p>{description}</p>
              <p>
                High: {Math.round(high)}°C • Low: {Math.round(low)}°C
              </p>
            </div>
          ))
        : null}

      {type === "12-hour" && Array.isArray(forecast)
        ? forecast.map((forecastItem: any, index: number) => (
            <div key={index} className="mb-3">
              <p className="font-bold">
                {new Date(forecastItem.dt * 1000).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p>{forecastItem.weather[0].description}</p>
              <p>{Math.round(forecastItem.main.temp)}°C</p>
            </div>
          ))
        : null}
    </div>
  );
}
