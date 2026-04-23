"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useAppStore } from "@/store/useAppStore";
import { useWeather } from "@/hooks/useWeather";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor, LocateFixed, Settings as SettingsIcon } from "lucide-react";

export default function SettingsModal() {
  const { setTheme, theme } = useTheme();
  const { setTargetLocation } = useAppStore();
  const { getWeather } = useWeather();
  const [isLocating, setIsLocating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleGeolocationUpdate = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation services are unavailable.");
      return;
    }
    
    setIsLocating(true);
    toast.info("Acquiring satellite lock...");
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getWeather(pos.coords.latitude, pos.coords.longitude);
        setIsLocating(false);
        setIsOpen(false);
        toast.success("Node recalibrated to current coordinates.");
      },
      () => {
        setIsLocating(false);
        toast.error("Coordinate retrieval failed.");
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
          <SettingsIcon className="h-5 w-5" />
          Settings
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md border-border/40 bg-background/95 backdrop-blur-2xl sm:rounded-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold tracking-tight">System Preferences</DialogTitle>
          <DialogDescription>
            Configure your atmospheric dashboard parameters.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Interface Theme
            </span>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={theme === "light" ? "default" : "secondary"}
                className="flex flex-col gap-2 rounded-xl py-6"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-5 w-5" />
                <span className="text-xs">Light</span>
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "secondary"}
                className="flex flex-col gap-2 rounded-xl py-6"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-5 w-5" />
                <span className="text-xs">Dark</span>
              </Button>
              <Button
                variant={theme === "system" ? "default" : "secondary"}
                className="flex flex-col gap-2 rounded-xl py-6"
                onClick={() => setTheme("system")}
              >
                <Monitor className="h-5 w-5" />
                <span className="text-xs">System</span>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Location Services
            </span>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-xl border-border/50 py-6 text-foreground/80 hover:text-foreground hover:bg-muted"
              onClick={handleGeolocationUpdate}
              disabled={isLocating}
            >
              <LocateFixed className={`h-5 w-5 ${isLocating ? "animate-pulse text-primary" : ""}`} />
              {isLocating ? "Calibrating..." : "Sync to Current GPS Coordinates"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}