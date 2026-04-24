import { MapPin } from "lucide-react";
import type { Suggestion } from "@/types/types";

interface SuggestionsProps {
  suggestions: Suggestion[];
  pickSuggestion: (suggestion: Suggestion) => void;
}

export default function Suggestions({ suggestions, pickSuggestion }: SuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <ul className="flex max-h-[300px] flex-col overflow-y-auto p-1.5 scrollbar-hide w-full">
      {suggestions.map((suggestion, index) => {
        const safeLon = suggestion.lon ?? (suggestion as any).lng ?? (suggestion as any).longitude ?? index;
        
        // Split the string for better typographic hierarchy (e.g., "Manila" / "Metro Manila, Philippines")
        const displayParts = (suggestion.display || "Unknown Location").split(',');
        const primaryText = displayParts[0].trim();
        const secondaryText = displayParts.slice(1).join(',').trim();

        return (
          <li key={`${suggestion.lat}-${safeLon}-${index}`} className="w-full">
            <button
              onClick={() => pickSuggestion(suggestion)}
              className="group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-all duration-200 hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/40 transition-colors group-hover:bg-background shadow-sm">
                <MapPin className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              </div>
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-sm font-semibold text-foreground truncate">
                  {primaryText}
                </span>
                {secondaryText && (
                  <span className="text-xs text-muted-foreground truncate mt-0.5">
                    {secondaryText}
                  </span>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}