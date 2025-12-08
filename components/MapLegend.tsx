// components/MapLegend.tsx
"use client";

import React from "react";

interface LegendProps {
  layer: "temp_new" | "precipitation_new" | "clouds_new" | "wind_new";
}

const legendData: Record<string, { color: string; label: string }[]> = {
  temp_new: [
    { color: "#821692", label: "< -40°C" },
    { color: "#208cec", label: "-20°C" },
    { color: "#23dddd", label: "0°C" },
    { color: "#ffff28", label: "20°C" },
    { color: "#fc8020", label: ">30°C" },
  ],
  clouds_new: [
    { color: "rgba(255,255,255,0.1)", label: "0-10%" },
    { color: "rgba(244,244,255,1)", label: "70-100%" },
  ],
  precipitation_new: [
    { color: "rgba(20,20,255,0.3)", label: "Light rain" },
    { color: "rgba(80,80,225,0.7)", label: "Heavy rain" },
  ],
  wind_new: [
    { color: "rgba(238,206,206,0.4)", label: "1-5 m/s" },
    { color: "rgba(70,0,175,1)", label: "100+ m/s" },
  ],
};

export default function MapLegend({ layer }: LegendProps) {
  const items = legendData[layer] || [];
  return (
    <div className="absolute bottom-4 right-4 z-20 bg-black/50 text-white p-2 rounded text-xs">
      <div className="font-bold mb-1">Legend</div>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-4 h-4 block border border-white"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
