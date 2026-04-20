import Link from "next/link";
import { Home, Map as MapIcon, Bookmark, Settings } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-16 lg:w-20 h-full border-r border-border/20 bg-card/10 backdrop-blur-xl flex flex-col items-center py-6 shrink-0 z-50">
      <div className="flex-1 flex flex-col gap-6 w-full items-center">
        {/* Brand Indicator */}
        <div className="w-10 h-10 rounded-full bg-primary/20 mb-4 flex items-center justify-center border border-primary/20">
          <span className="font-bold text-primary font-sans">C</span>
        </div>
        
        <NavIcon href="/" icon={Home} active />
        <NavIcon href="/map" icon={MapIcon} />
        <NavIcon href="/favorites" icon={Bookmark} />
      </div>
      
      <div className="mt-auto">
        <NavIcon href="/settings" icon={Settings} />
      </div>
    </aside>
  );
}

function NavIcon({ href, icon: Icon, active = false }: { href: string; icon: React.ElementType; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`p-3 rounded-2xl transition-all duration-200 transform-gpu ${
        active 
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="w-5 h-5 stroke-[2]" />
    </Link>
  );
}