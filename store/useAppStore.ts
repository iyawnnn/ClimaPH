import { create } from "zustand";
import { AppState } from "@/types/types"; // Adjust path if necessary

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