import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Suggestion } from "@/types/types";

export interface AppState {
  targetLocation: Suggestion | null;
  isCrisisMode: boolean;
  unit: "C" | "F";
  mapLayer: string;
  hasCompletedOnboarding: boolean;
  setTargetLocation: (location: Suggestion | null) => void;
  toggleCrisisMode: () => void;
  setUnit: (unit: "C" | "F") => void;
  setMapLayer: (layer: string) => void;
  completeOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      targetLocation: null,
      isCrisisMode: false,
      unit: "C",
      mapLayer: "temp_new",
      hasCompletedOnboarding: false,

      setTargetLocation: (location) => set({ targetLocation: location }),
      toggleCrisisMode: () => set((state) => ({ isCrisisMode: !state.isCrisisMode })),
      setUnit: (unit) => set({ unit }),
      setMapLayer: (layer) => set({ mapLayer: layer }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
    }),
    {
      name: "climaph-storage", // The key used in Local Storage
    }
  )
);