"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAppStore } from "@/store/useAppStore";
import L from "leaflet";

// Fix Leaflet's default icon path issues in Next.js environments
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Helper component to smoothly pan the map when coordinates change
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true, duration: 1 });
  }, [center, map]);
  return null;
}

export default function WeatherMap() {
  const { targetLocation, mapLayer } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);
  const [mapKey] = useState(() => `map-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground font-sans">
            Initializing Telemetry
          </span>
        </div>
      </div>
    );
  }

  const defaultCenter: [number, number] = [14.5995, 120.9842]; // Metro Manila

  // Robustly handle both 'lon' (OpenWeather) and 'lng' (OpenCage) data structures
  const safeLon = targetLocation?.lon ?? (targetLocation as any)?.lng ?? defaultCenter[1];
  const safeLat = targetLocation?.lat ?? defaultCenter[0];
  
  const center: [number, number] = [safeLat, safeLon];

  // Match the exact environment variable from your .env configuration
  const weatherApiKey = process.env.NEXT_PUBLIC_OWM_API_KEY;

  return (
    <div className="h-full w-full relative z-0" id="weather-map-root">
      <MapContainer
        key={mapKey}
        center={center}
        zoom={11}
        zoomControl={false}
        className="h-full w-full rounded-3xl bg-muted/10 z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {mapLayer && weatherApiKey && (
          <TileLayer
            url={`https://tile.openweathermap.org/map/${mapLayer}/{z}/{x}/{y}.png?appid=${weatherApiKey}`}
            opacity={0.6}
            className="mix-blend-multiply"
          />
        )}
        
        <Marker position={center} icon={customIcon}>
          <Popup className="font-sans rounded-xl border-border/20 shadow-xl">
            <span className="font-semibold text-sm">
              {targetLocation?.display || "Metro Manila"}
            </span>
          </Popup>
        </Marker>
        
        <MapUpdater center={center} />
      </MapContainer>
      
      <div className="absolute inset-0 pointer-events-none rounded-3xl shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] z-10" />
    </div>
  );
}