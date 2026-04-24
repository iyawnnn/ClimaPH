import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = searchParams.get("limit") || "5";

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${env.OPENCAGE_API_KEY}&countrycode=PH&limit=${limit}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Geocoding provider returned an error");
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Geocoding proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}