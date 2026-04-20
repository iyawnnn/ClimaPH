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
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      getWeather();
    }
  };

  const clearInput = () => {
    onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="relative flex w-full items-center group">
      <div className="absolute left-3 flex items-center pointer-events-none z-10 text-muted-foreground/40 group-focus-within:text-foreground transition-colors duration-300">
        {loadingWeather ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </div>
      
      <input
        type="text"
        placeholder="Search nodes..."
        value={input}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className="flex h-9 w-full rounded-md border border-transparent bg-muted/30 pl-9 pr-9 text-sm text-foreground transition-all duration-300 focus-visible:border-border/40 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-muted/20 placeholder:text-muted-foreground/40"
        spellCheck={false}
      />

      <div className="absolute right-2 flex items-center z-10">
        {input && (
          <button
            onClick={clearInput}
            className="p-1 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/40 transition-colors duration-200"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}