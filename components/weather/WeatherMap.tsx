"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type MapLayerType = "temp_new" | "precipitation_new" | "clouds_new" | "wind_new";

type WeatherMapProps = {
  center: [number, number];
  zoom: number;
  layer: MapLayerType;
};

// Safety wrapper for map updates
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !center) return;
    
    // Tiny timeout to ensure map is fully initialized before moving
    const t = setTimeout(() => {
      try {
        map.setView(center, zoom);
      } catch (e) {
        // Ignore errors if map is unmounting
      }
    }, 100);

    return () => clearTimeout(t);
  }, [center, zoom, map]);

  return null;
}

export default function WeatherMap({ center, zoom, layer }: WeatherMapProps) {
  // Unique key to force clean mount/unmount when location changes drastically
  const [mapKey, setMapKey] = useState(Date.now().toString());

  useEffect(() => {
    // Fix icons
    const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
    const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
    const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });
  }, []);

  return (
    <div className="h-full w-full relative">
       {/* Key forces a fresh map instance only if strictly needed, usually typically stable */}
      <MapContainer
        key="weather-map-container" 
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <MapUpdater center={center} zoom={zoom} />
        
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; OpenStreetMap' 
        />

        <TileLayer 
          key={layer} 
          url={`https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OWM_API_KEY}`} 
          attribution='&copy; OpenWeatherMap' 
        />

        <Marker position={center} />
      </MapContainer>
    </div>
  );
}