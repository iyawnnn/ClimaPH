"use client";

import { MapPin } from "lucide-react";
import type { Suggestion } from "@/types/types";

interface SuggestionsProps {
  suggestions: Suggestion[];
  pickSuggestion: (suggestion: Suggestion) => void;
}

export default function Suggestions({ suggestions, pickSuggestion }: SuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <ul className="flex max-h-[320px] flex-col overflow-y-auto p-2 scrollbar-hide w-full">
      {suggestions.map((suggestion, index) => (
        <li key={`${suggestion.lat}-${suggestion.lon}-${index}`} className="w-full">
          <button
            onClick={() => pickSuggestion(suggestion)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/30">
              <MapPin className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate w-full">
                {suggestion.name || suggestion.display.split(',')[0]}
              </span>
              <span className="text-xs text-muted-foreground truncate w-full mt-0.5">
                {suggestion.display}
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}