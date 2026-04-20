import { Suggestion } from "@/types/types";
import { MapPin } from "lucide-react";

type SuggestionsProps = {
  suggestions: Suggestion[];
  // UPDATED: Now accepts a void return to be generic
  pickSuggestion: (suggestion: Suggestion) => void; 
};

export default function Suggestions({ suggestions, pickSuggestion }: SuggestionsProps) {
  if (!suggestions.length) return null;

  return (
    <ul className="bg-popover text-popover-foreground border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 max-h-[300px] overflow-y-auto z-[60]">
      {suggestions.map((suggestion, index) => (
        <li
          key={`${suggestion.lat}-${suggestion.lng}-${index}`}
          onClick={() => pickSuggestion(suggestion)}
          className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-3 border-b last:border-0"
        >
          <div className="bg-muted p-2 rounded-full">
             <MapPin className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-medium text-sm">
                {suggestion.display.split(",")[0]}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                {suggestion.display}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}