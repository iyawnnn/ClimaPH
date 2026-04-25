import Link from "next/link";
import { CloudOff, MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground font-sans selection:bg-muted">
      <div className="flex max-w-md flex-col items-center space-y-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/20 border border-border/10 shadow-inner">
          <CloudOff className="h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Atmospheric Anomaly Detected
          </h1>
          <p className="text-sm font-medium tracking-wide text-muted-foreground/80">
            The coordinates you are looking for do not exist in the current spatial index.
          </p>
        </div>

        <Link
          href="/"
          className="group flex items-center gap-2 rounded-xl bg-muted/40 px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Return to application root"
        >
          <MoveLeft 
            className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-x-1" 
            strokeWidth={1.5} 
          />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}