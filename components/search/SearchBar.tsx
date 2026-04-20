"use client";

import { Search, X, Loader2 } from "lucide-react";

interface SearchBarProps {
  input: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getWeather: () => void;
  loadingWeather: boolean;
  hasValidSelection: boolean;
}

export default function SearchBar({
  input,
  onChange,
  getWeather,
  loadingWeather,
  hasValidSelection,
}: SearchBarProps) {
  return (
    <div className="relative w-full h-full flex items-center group">
      {/* Search Icon */}
      <div className="absolute left-4 flex h-full items-center justify-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" strokeWidth={2} />
      </div>

      <input
        type="text"
        placeholder="Enter city or coordinates..."
        value={input}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input.trim()) {
            getWeather();
          }
        }}
        className="h-full w-full bg-transparent pl-11 pr-12 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:ring-0"
        spellCheck={false}
        autoComplete="off"
      />

      {/* Action Area: Clear button or Loading Spinner */}
      <div className="absolute right-2 flex h-full items-center justify-center gap-1">
        {loadingWeather ? (
          <div className="flex h-8 w-8 items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-primary" strokeWidth={2.5} />
          </div>
        ) : (
          input.length > 0 && (
            <button
              onClick={() => {
                // Simulate an empty event to clear the input
                onChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          )
        )}
      </div>
    </div>
  );
}