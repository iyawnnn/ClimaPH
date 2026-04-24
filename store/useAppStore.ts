import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import type { Suggestion } from "@/types/types";

export interface AppState {
  targetLocation: Suggestion | null;
  unit: "C" | "F";
  mapLayer: string;
  baseMap: "light" | "dark" | "satellite";
  hasCompletedOnboarding: boolean;
  favorites: Suggestion[];
  setTargetLocation: (location: Suggestion | null) => void;
  setUnit: (unit: "C" | "F") => void;
  setMapLayer: (layer: string) => void;
  setBaseMap: (map: "light" | "dark" | "satellite") => void;
  completeOnboarding: () => void;
  toggleFavorite: (location: Suggestion) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      targetLocation: null,
      unit: "C",
      mapLayer: "wind_new",
      baseMap: "dark",
      hasCompletedOnboarding: false,
      favorites: [],

      setTargetLocation: (location) => set({ targetLocation: location }),
      setUnit: (unit) => set({ unit }),
      setMapLayer: (layer) => set({ mapLayer: layer }),
      setBaseMap: (map) => set({ baseMap: map }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      
      toggleFavorite: (location) => {
        const currentFavorites = get().favorites;
        
        // 0.01 tolerance accounts for minor geocoding variations
        const coordinateTolerance = 0.01;
        
        const existingIndex = currentFavorites.findIndex((f) => {
          const fLon = f.lon ?? (f as any).lng;
          const lLon = location.lon ?? (location as any).lng;
          
          const isLatMatch = Math.abs(f.lat - location.lat) < coordinateTolerance;
          const isLonMatch = Math.abs(fLon - lLon) < coordinateTolerance;
          
          return isLatMatch && isLonMatch;
        });
        
        if (existingIndex !== -1) {
          const newFavorites = [...currentFavorites];
          newFavorites.splice(existingIndex, 1);
          set({ favorites: newFavorites });
          toast.info("Location Removed");
        } else {
          set({ favorites: [...currentFavorites, location] });
          toast.success("Location Saved");
        }
      },
    }),
    { name: "climaph-storage" }
  )
);