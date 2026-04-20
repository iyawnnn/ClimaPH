import { create } from "zustand";
import type { Suggestion } from "@/types/types";

interface AppState {
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
  targetLocation: null,
  isCrisisMode: false,
  unit: "C",
  mapLayer: "temp_new",
  setTargetLocation: (loc) => set({ targetLocation: loc }),
  toggleCrisisMode: () => set((state) => ({ isCrisisMode: !state.isCrisisMode })),
  setUnit: (unit) => set({ unit }),
  setMapLayer: (mapLayer) => set({ mapLayer }),
}));