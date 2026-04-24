"use client";

import { useEffect, useState } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useAppStore } from "@/store/useAppStore";

export default function WeatherMap() {
  const { targetLocation, mapLayer } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const defaultCenter = { lat: 15.0286, lon: 120.6925 };
  const safeLon = targetLocation?.lon ?? (targetLocation as any)?.lng ?? defaultCenter.lon;
  const safeLat = targetLocation?.lat ?? defaultCenter.lat;

  // CRITICAL: Ensure this variable is populated!
  const weatherApiKey = process.env.NEXT_PUBLIC_OWM_API_KEY;

  if (!isMounted) return null;

  return (
    <div className="h-full w-full relative z-0 bg-background" id="weather-map-root">
      <Map
        initialViewState={{ longitude: safeLon, latitude: safeLat, zoom: 11 }}
        longitude={safeLon}
        latitude={safeLat}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        interactive={true}
        dragPan={true}
        scrollZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Dynamic Weather Layer */}
        {mapLayer && weatherApiKey && (
          <Source
            key={mapLayer} // This key forces the map to remount the layer on change
            id={`owm-${mapLayer}`}
            type="raster"
            tiles={[`https://tile.openweathermap.org/map/${mapLayer}/{z}/{x}/{y}.png?appid=${weatherApiKey}`]}
            tileSize={256}
          >
            <Layer
              id={`owm-${mapLayer}-layer`}
              type="raster"
              source={`owm-${mapLayer}`}
              paint={{ "raster-opacity": 0.85 }}
            />
          </Source>
        )}

        <Marker longitude={safeLon} latitude={safeLat} anchor="center">
          <div className="relative flex items-center justify-center cursor-pointer group">
            <div className="absolute w-8 h-8 bg-[#FCD116]/40 rounded-full animate-ping" />
            <div className="relative w-5 h-5 bg-[#0038A8] border-2 border-white rounded-full shadow-md z-10 transition-transform group-hover:scale-110" />
            <div 
              className="absolute top-full mt-2 px-3 py-1 bg-background/90 backdrop-blur-sm border border-border/40 shadow-lg rounded pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <span className="font-bold text-xs text-foreground">
                {targetLocation?.display || "San Fernando, Pampanga, Philippines"}
              </span>
            </div>
          </div>
        </Marker>
      </Map>
    </div>
  );
}