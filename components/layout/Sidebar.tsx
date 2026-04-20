"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAppStore } from "@/store/useAppStore";
import { Home, Map as MapIcon, Bookmark, Sun, Moon, Activity } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { isCrisisMode, toggleCrisisMode } = useAppStore();

  return (
    <aside className="w-16 lg:w-20 h-full flex flex-col items-center py-6 shrink-0 z-50 border-r border-border/20 bg-background/50">
      
      {/* Brand Logo - Shrink-0 prevents crushing */}
      <div className="w-full flex justify-center mb-8 shrink-0">
        <Link href="/" className="relative w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center transition-transform hover:scale-105">
          <Image
            src="/climaph-brand-logo.webp"
            alt="ClimaPH"
            fill
            className="object-contain"
            priority
          />
        </Link>
      </div>
      
      {/* Primary Navigation */}
      <nav className="flex flex-col gap-4 w-full items-center shrink-0">
        <NavIcon href="/" icon={Home} active={pathname === "/"} />
        <NavIcon href="/map" icon={MapIcon} active={pathname === "/map"} />
        <NavIcon href="/favorites" icon={Bookmark} active={pathname === "/favorites"} />
      </nav>
      
      {/* Bottom Toggles - mt-auto pushes it down, shrink-0 prevents overlap */}
      <div className="mt-auto flex flex-col gap-4 w-full items-center shrink-0 pt-6">
        <button
          onClick={toggleCrisisMode}
          className={`p-3 rounded-2xl transition-all duration-200 ${
            isCrisisMode 
              ? "bg-destructive/20 text-destructive shadow-sm animate-pulse" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          aria-label="Toggle Crisis Mode"
        >
          <Activity className="w-5 h-5 stroke-[2]" />
        </button>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-3 rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
          aria-label="Toggle Theme"
        >
          <Sun className="w-5 h-5 stroke-[2] hidden dark:block" />
          <Moon className="w-5 h-5 stroke-[2] block dark:hidden" />
        </button>
      </div>
    </aside>
  );
}

function NavIcon({ href, icon: Icon, active = false }: { href: string; icon: React.ElementType; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`p-3 rounded-2xl transition-all duration-200 ${
        active 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="w-5 h-5 stroke-[2]" />
    </Link>
  );
}