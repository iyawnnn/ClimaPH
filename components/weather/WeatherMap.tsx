"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAppStore } from "@/store/useAppStore";
import L from "leaflet";

const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

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
      <div className="h-full w-full flex items-center justify-center bg-background border border-border/20 rounded-none">
        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground" style={{ fontFamily: "var(--font-instrument-sans), sans-serif" }}>
          Initializing Telemetry
        </span>
      </div>
    );
  }

  const defaultCenter: [number, number] = [15.0286, 120.6925];

  const safeLon = targetLocation?.lon ?? (targetLocation as any)?.lng ?? defaultCenter[1];
  const safeLat = targetLocation?.lat ?? defaultCenter[0];
  const center: [number, number] = [safeLat, safeLon];

  const weatherApiKey = process.env.NEXT_PUBLIC_OWM_API_KEY;

  return (
    <div className="h-full w-full relative z-0 bg-background" id="weather-map-root">
      <MapContainer
        key={mapKey}
        center={center}
        zoom={11}
        zoomControl={false} 
        preferCanvas={true} 
        wheelPxPerZoomLevel={120}
        className="h-full w-full z-0 rounded-none"
      >
        <TileLayer
          attribution='&copy; CartoDB'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          keepBuffer={4} 
        />
        
        {mapLayer && weatherApiKey && (
          <TileLayer
            url={`https://tile.openweathermap.org/map/${mapLayer}/{z}/{x}/{y}.png?appid=${weatherApiKey}`}
            opacity={0.6}
            keepBuffer={4}
            className="mix-blend-multiply"
          />
        )}
        
        <Marker position={center} icon={customIcon}>
          <Popup className="rounded-xl border-border/20 shadow-xl" style={{ fontFamily: "var(--font-instrument-sans), sans-serif" }}>
            <span className="font-bold text-sm text-[#0038A8]">
              {targetLocation?.display || "San Fernando, Pampanga"}
            </span>
          </Popup>
        </Marker>
        
        <MapUpdater center={center} />
      </MapContainer>
    </div>
  );
}