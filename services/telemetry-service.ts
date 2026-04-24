export async function fetchTelemetryData(lat: string, lon: string) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.openweathermap.org/data/2.5';

  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY environment variable is missing.');
  }

  const [weatherRes, airRes] = await Promise.all([
    fetch(`${baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
    fetch(`${baseUrl}/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
  ]);

  if (!weatherRes.ok || !airRes.ok) {
    throw new Error('Failed to fetch telemetry payload from origin.');
  }

  const weatherData = await weatherRes.json();
  const airData = await airRes.json();

  return { weatherData, airData };
}