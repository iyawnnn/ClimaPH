import { create } from "zustand";
import type { Suggestion } from "@/types/types";

export interface AppState {
  targetLocation: Suggestion | null;
  isCrisisMode: boolean;
  unit: "C" | "F";
  mapLayer: string;
  setTargetLocation: (location: Suggestion | null) => void;
  toggleCrisisMode: () => void;
  setUnit: (unit: "C" | "F") => void;
  setMapLayer: (layer: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  targetLocation: { 
    display: "Metro Manila", 
    lat: 14.5995, 
    lon: 120.9842 
  },
  isCrisisMode: false,
  unit: "C",
  mapLayer: "temp_new",
  
  setTargetLocation: (location) => set({ targetLocation: location }),
  toggleCrisisMode: () => set((state) => ({ isCrisisMode: !state.isCrisisMode })),
  setUnit: (unit) => set({ unit }),
  setMapLayer: (layer) => set({ mapLayer: layer }),
}));