"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAppStore } from "@/store/useAppStore";
import { LayoutGrid, Compass, Sun, Moon, ShieldAlert } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SavedLocationsModal } from "@/components/layout/SavedLocationsModal";

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { isCrisisMode, toggleCrisisMode } = useAppStore();

  return (
    <aside className="hidden lg:flex w-24 h-full flex-col items-center py-8 shrink-0 z-50 bg-background/50 border-r border-border/40 backdrop-blur-xl">
      <div className="w-full flex justify-center mb-10 shrink-0">
        <Link href="/" className="relative w-14 h-14 flex items-center justify-center transition-transform hover:scale-105">
          <Image src="/climaph-brand-logo.webp" alt="ClimaPH Brand Logo" fill sizes="(max-width: 768px) 40px, 56px" className="object-contain" priority />
        </Link>
      </div>

      <nav className="flex flex-col gap-4 w-full items-center shrink-0">
        <NavIcon href="/" icon={LayoutGrid} label="Dashboard" active={pathname === "/"} />
        <NavIcon href="/map" icon={Compass} label="Global Radar" active={pathname === "/map"} />
        
        <SavedLocationsModal />
      </nav>

      <div className="mt-auto flex flex-col gap-4 w-full items-center shrink-0 pt-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleCrisisMode}
              className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 border outline-none ${
                isCrisisMode ? "bg-[#CE1126] text-white border-[#CE1126] animate-pulse shadow-[0_0_15px_rgba(206,17,38,0.5)]" : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <ShieldAlert className="w-5 h-5 stroke-[1.5]" />
              <span className="sr-only">Toggle Crisis Mode</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={16} className="bg-foreground text-background border-none font-sans font-semibold tracking-wide shadow-xl">
            {isCrisisMode ? "Disable Crisis Protocol" : "Enable Crisis Protocol"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-14 h-14 flex items-center justify-center rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 outline-none">
              <Sun className="w-5 h-5 stroke-[1.5] hidden dark:block" />
              <Moon className="w-5 h-5 stroke-[1.5] block dark:hidden" />
              <span className="sr-only">Toggle Theme</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={16} className="bg-foreground text-background border-none font-sans font-semibold tracking-wide shadow-xl">
            Toggle Interface Theme
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}

function NavIcon({ href, icon: Icon, label, active = false }: { href: string; icon: React.ElementType; label: string; active?: boolean; }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-200 outline-none ${
            active ? "bg-[#0038A8] text-white shadow-md shadow-[#0038A8]/30" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Icon className="w-5 h-5 stroke-[1.5]" />
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={16} className="bg-foreground text-background border-none font-sans font-semibold tracking-wide shadow-xl">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}