import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ layer: string; z: string; x: string; y: string }> }
) {
  const { layer, z, x, y } = await params;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return new NextResponse("Tile server configuration error", { status: 500 });
  }

  const owmUrl = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`;

  try {
    const response = await fetch(owmUrl);

    if (!response.ok) {
      return new NextResponse("Upstream tile fetch failed", { status: response.status });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}