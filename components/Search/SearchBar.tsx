import { Button } from "@/components/ui/button";

type SearchBarProps = {
  input: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getWeather: () => void;
  loadingWeather: boolean;
};

export default function SearchBar({
  input,
  onChange,
  getWeather,
  loadingWeather,
}: SearchBarProps) {
  return (
    <div className="flex gap-2">
      <input
        value={input}
        onChange={onChange}
        placeholder="Enter city or province"
        className="p-2 border rounded flex-1"
      />
      <Button onClick={getWeather}>
        {loadingWeather ? "Loading..." : "Get Weather"}
      </Button>
    </div>
  );
}
