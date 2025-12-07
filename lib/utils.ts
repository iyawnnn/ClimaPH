import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SUGGESTIONS_TTL, WEATHER_TTL } from "./constants";

// Existing cn function (required for shadcn components like button.tsx)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Capitalize function to ensure proper formatting
export const capitalize = (s = "") =>
  s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");

// Make display name from components
export const makeDisplayNameFromComponents = (
  components: any,
  formatted?: string
) => {
  if (!components || typeof components !== "object")
    return formatted || "Philippines";
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

// Cache and TTL management
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

export const isValidSuggestion = (s: any) => {
  if (!s) return false;
  if (
    !s.geometry ||
    typeof s.geometry.lat !== "number" ||
    typeof s.geometry.lng !== "number"
  )
    return false;
  if (!s.components || Object.keys(s.components).length === 0) return false;
  return true;
};