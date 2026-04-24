import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const units = searchParams.get("units") || "metric";
  const type = searchParams.get("type") || "weather"; 

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing coordinate parameters" }, { status: 400 });
  }

  const endpoint = type === "forecast" ? "forecast" : "weather";
  const url = `https://api.openweathermap.org/data/2.5/${endpoint}?lat=${lat}&lon=${lon}&appid=${env.OPENWEATHER_API_KEY}&units=${units}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Weather provider returned an error");
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Weather proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}