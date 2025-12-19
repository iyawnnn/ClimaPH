import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for merging classes (required for ShadCN components)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Capitalize words
export const capitalize = (s = "") =>
  s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");

// Display name from components
export const makeDisplayNameFromComponents = (components: any, formatted?: string) => {
  if (!components || typeof components !== "object") return formatted || "Philippines";
  const city =
    components.city ||
    components.town ||
    components.municipality ||
    components.village ||
    components.county ||
    null;
  const region = components.state || components.region || null;
  if (city && region) return `${city}, ${region}, Philippines`;
  if (city) return `${city}, Philippines`;
  if (region) return `${region}, Philippines`;
  return formatted || "Philippines";
};

// Cache with TTL
export const setWithTTL = (key: string, value: any, ttl: number) => {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), ttl, value }));
  } catch {}
};

export const getWithTTL = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > parsed.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
};

// Validate suggestion from API
export const isValidSuggestion = (s: any) => {
  if (!s) return false;
  if (!s.geometry || typeof s.geometry.lat !== "number" || typeof s.geometry.lng !== "number") return false;
  if (!s.components || Object.keys(s.components).length === 0) return false;
  return true;
};

export function calculateHeatIndex(tempC: number, humidity: number): number {
  // Formula requires Fahrenheit
  const T = (tempC * 9) / 5 + 32;
  const R = humidity;

  const c1 = -42.379;
  const c2 = 2.04901523;
  const c3 = 10.14333127;
  const c4 = -0.22475541;
  const c5 = -6.83783 * Math.pow(10, -3);
  const c6 = -5.481717 * Math.pow(10, -2);
  const c7 = 1.22874 * Math.pow(10, -3);
  const c8 = 8.5282 * Math.pow(10, -4);
  const c9 = -1.99 * Math.pow(10, -6);

  let HI =
    c1 +
    c2 * T +
    c3 * R +
    c4 * T * R +
    c5 * T * T +
    c6 * R * R +
    c7 * T * T * R +
    c8 * T * R * R +
    c9 * T * T * R * R;

  // Convert back to Celsius
  return ((HI - 32) * 5) / 9;
}

export function getHeatIndexLabel(hiC: number): { label: string; color: string } {
  if (hiC < 27) return { label: "Comfortable", color: "text-green-500" };
  if (hiC < 32) return { label: "Caution", color: "text-yellow-500" };
  if (hiC < 41) return { label: "Extreme Caution", color: "text-orange-500" };
  if (hiC < 54) return { label: "Danger", color: "text-red-500" };
  return { label: "Extreme Danger", color: "text-purple-600" };
}

export type SampayStatus = {
  status: "good" | "caution" | "bad";
  message: string;
  color: string;
};

export function getSampayAdvice(weatherId: number, humidity: number, clouds: number): SampayStatus {
  // Rain codes: 200-531 (Thunderstorm, Drizzle, Rain)
  if (weatherId >= 200 && weatherId <= 531) {
    return { 
      status: "bad", 
      message: "Wag na maglaba. Uulan.", 
      color: "text-red-500" 
    };
  }
  
  // High humidity (> 85%) means clothes won't dry well
  if (humidity > 85) {
     return { 
       status: "caution", 
       message: "Mahirap matuyo (Basa ang hangin).", 
       color: "text-orange-500" 
     };
  }
  
  // Very cloudy (> 80%)
  if (clouds > 80) {
      return { 
        status: "caution", 
        message: "Makulimlim. Matagal matuyo.", 
        color: "text-yellow-500" 
      };
  }

  return { 
    status: "good", 
    message: "Gandang maglaba! Sikat ang araw.", 
    color: "text-green-500" 
  };
}

export function getPayongAdvice(weatherId: number, temp: number): string | null {
    // Rain or Drizzle
    if (weatherId >= 200 && weatherId <= 531) {
        return "Bring an umbrella. Uulan ngayon.";
    }
    // Very Hot (> 32°C)
    if (temp > 32) {
         return "Mainit! Mag-payong pang-araw.";
    }
    return null; // No need
}
