import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type SearchBarProps = {
  input: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getWeather: () => void;
  loadingWeather: boolean;
  hasValidSelection: boolean; // NEW: indicates if a suggestion is selected
};

export default function SearchBar({
  input,
  onChange,
  getWeather,
  loadingWeather,
  hasValidSelection,
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Only call getWeather if a valid selection exists
      if (hasValidSelection) {
        getWeather();
      } else {
        // Optionally: show a toast or ignore
        console.log("No valid suggestion selected.");
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={input}
        onChange={onChange}
        onKeyDown={handleKeyDown} // listen for Enter
        placeholder="Enter city or province"
        className="flex-1"
      />
      <Button onClick={getWeather} disabled={loadingWeather || !hasValidSelection}>
        {loadingWeather ? <Spinner className="w-4 h-4" /> : "Get Weather"}
      </Button>
    </div>
  );
}
