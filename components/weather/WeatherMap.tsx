"use client";

import { useEffect, useState, useMemo } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useAppStore } from "@/store/useAppStore";
import type { MapStyle } from "react-map-gl/maplibre";

export default function WeatherMap() {
  const { targetLocation, mapLayer } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background border-none rounded-none">
        <span 
          className="text-xs font-bold tracking-widest uppercase text-muted-foreground" 
          style={{ fontFamily: "var(--font-instrument-sans), sans-serif" }}
        >
          Initializing Telemetry
        </span>
      </div>
    );
  }

  const defaultCenter = { lat: 15.0286, lon: 120.6925 };
  
  const safeLon = targetLocation?.lon ?? (targetLocation as any)?.lng ?? defaultCenter.lon;
  const safeLat = targetLocation?.lat ?? defaultCenter.lat;

  const weatherApiKey = process.env.NEXT_PUBLIC_OWM_API_KEY;

  // Construct the WebGL style object dynamically to handle layer changes
  const mapStyle = useMemo<MapStyle>(() => {
    const style: MapStyle = {
      version: 8,
      sources: {
        "carto-basemap": {
          type: "raster",
          tiles: ["https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png"],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "carto-basemap-layer",
          type: "raster",
          source: "carto-basemap",
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    };

    if (mapLayer && weatherApiKey) {
      style.sources["owm-weather"] = {
        type: "raster",
        tiles: [`https://tile.openweathermap.org/map/${mapLayer}/{z}/{x}/{y}.png?appid=${weatherApiKey}`],
        tileSize: 256,
      };
      
      style.layers.push({
        id: "owm-weather-layer",
        type: "raster",
        source: "owm-weather",
        paint: {
          "raster-opacity": 0.6,
        },
      });
    }

    return style;
  }, [mapLayer, weatherApiKey]);

  return (
    <div className="h-full w-full relative z-0 bg-background" id="weather-map-root">
      <Map
        initialViewState={{
          longitude: safeLon,
          latitude: safeLat,
          zoom: 11,
        }}
        // Controlled view state ensures the map pans when coordinates change
        longitude={safeLon}
        latitude={safeLat}
        mapStyle={mapStyle}
        interactive={true}
        dragPan={true}
        dragRotate={false}
        scrollZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <Marker 
          longitude={safeLon} 
          latitude={safeLat} 
          anchor="center"
        >
          <div className="relative flex items-center justify-center cursor-pointer group">
            {/* Outer pulsing ring for live status indication */}
            <div className="absolute w-8 h-8 bg-[#FCD116]/40 rounded-full animate-ping" />
            
            {/* Core branded marker */}
            <div className="relative w-5 h-5 bg-[#0038A8] border-2 border-white rounded-full shadow-md z-10 transition-transform group-hover:scale-110" />
            
            {/* Floating label */}
            <div 
              className="absolute top-full mt-2 px-3 py-1 bg-background/90 backdrop-blur-sm border border-border/40 shadow-lg rounded pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20"
              style={{ fontFamily: "var(--font-instrument-sans), sans-serif" }}
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