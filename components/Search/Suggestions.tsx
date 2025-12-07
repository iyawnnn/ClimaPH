import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";

type SuggestionProps = {
  suggestions: { id: string; display: string }[];
  pickSuggestion: (s: { id: string; display: string }) => void;
};

export default function Suggestions({ suggestions, pickSuggestion }: SuggestionProps) {
  return (
    <Command className="mt-2 border rounded max-h-56 overflow-auto">
      <CommandInput placeholder="Search results..." />
      <CommandList>
        {suggestions.length === 0 && <CommandEmpty>No suggestions</CommandEmpty>}
        {suggestions.map((s) => (
          <CommandItem key={s.id} onSelect={() => pickSuggestion(s)}>
            {s.display}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  );
}
