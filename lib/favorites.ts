import { Suggestion } from "@/types/types";

const FAVORITES_KEY = "weather_favorites";

export const getFavorites = (): Suggestion[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(FAVORITES_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as Suggestion[];
  } catch {
    return [];
  }
};

export const addFavorite = (location: Suggestion) => {
  const favorites = getFavorites();
  if (!favorites.some((f) => f.display === location.display)) {
    favorites.push(location);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
};

export const removeFavorite = (location: Suggestion) => {
  let favorites = getFavorites();
  favorites = favorites.filter((f) => f.display !== location.display);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};
