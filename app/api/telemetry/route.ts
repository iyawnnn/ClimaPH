import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  const baseUrl = 'https://api.openweathermap.org/data/2.5';

  try {
    const [weatherRes, airRes] = await Promise.all([
      fetch(`${baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
      fetch(`${baseUrl}/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
    ]);

    if (!weatherRes.ok || !airRes.ok) {
      throw new Error('Upstream API error');
    }

    const weatherData = await weatherRes.json();
    const airData = await airRes.json();

    return NextResponse.json({ weatherData, airData });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch telemetry data' }, { status: 500 });
  }
}