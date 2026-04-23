import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import type { Suggestion } from "@/types/types";

export interface AppState {
  targetLocation: Suggestion | null;
  unit: "C" | "F";
  mapLayer: string;
  hasCompletedOnboarding: boolean;
  favorites: Suggestion[];
  setTargetLocation: (location: Suggestion | null) => void;
  setUnit: (unit: "C" | "F") => void;
  setMapLayer: (layer: string) => void;
  completeOnboarding: () => void;
  toggleFavorite: (location: Suggestion) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      targetLocation: null,
      unit: "C",
      mapLayer: "temp_new",
      hasCompletedOnboarding: false,
      favorites: [],

      setTargetLocation: (location) => set({ targetLocation: location }),
      setUnit: (unit) => set({ unit }),
      setMapLayer: (layer) => set({ mapLayer: layer }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      
      toggleFavorite: (location) => {
        const currentFavorites = get().favorites;
        const isFavorited = currentFavorites.some((f) => f.display === location.display);
        
        if (isFavorited) {
          set({ favorites: currentFavorites.filter((f) => f.display !== location.display) });
          toast.info("Location Removed", {
            description: `${location.display} removed from saved locations.`,
          });
        } else {
          set({ favorites: [...currentFavorites, location] });
          toast.success("Location Saved", {
            description: `${location.display} securely saved to your list.`,
          });
        }
      },
    }),
    {
      name: "climaph-storage",
    }
  )
);