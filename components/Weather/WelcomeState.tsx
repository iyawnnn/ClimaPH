import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

type WelcomeStateProps = {
  onUseLocation: () => void;
  onSelectCity: (city: string, lat: number, lon: number) => void;
};

// Expanded list of popular PH locations
const POPULAR_CITIES = [
  { name: "Manila", lat: 14.5995, lon: 120.9842 },
  { name: "Quezon City", lat: 14.676, lon: 121.0437 },
  { name: "Cebu City", lat: 10.3157, lon: 123.8854 },
  { name: "Davao City", lat: 7.1907, lon: 125.4553 },
  { name: "Baguio", lat: 16.4023, lon: 120.596 },
  { name: "Tagaytay", lat: 14.1153, lon: 120.9621 },
  { name: "Puerto Princesa", lat: 9.7392, lon: 118.7353 },
  { name: "Boracay", lat: 11.9674, lon: 121.9248 },
  { name: "Siargao", lat: 9.7892, lon: 126.1559 },
];

export default function WelcomeState({ onUseLocation, onSelectCity }: WelcomeStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center animate-in fade-in zoom-in duration-500">
      
      {/* Hero Section */}
      <div className="space-y-4 max-w-lg">
        <div className="bg-blue-500/10 p-4 rounded-full w-fit mx-auto ring-1 ring-blue-500/20">
          <MapPin className="h-12 w-12 text-blue-500" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome to ClimaPH
        </h2>
        {/* FIX: Concise 2-line description */}
        <p className="text-muted-foreground text-lg px-4 leading-relaxed">
          Your specialized weather companion for the Philippines. <br className="hidden md:block" />
          Get accurate, localized forecasts for your city or province.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-6">
        <Button 
          size="lg" 
          className="w-full gap-2 text-base font-semibold shadow-md hover:shadow-lg transition-all" 
          onClick={onUseLocation}
        >
          <Navigation className="h-4 w-4" />
          Use My Current Location
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or choose a popular city
            </span>
          </div>
        </div>

        {/* Popular Cities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {POPULAR_CITIES.map((city) => (
            <Button
              key={city.name}
              variant="outline"
              className="h-auto py-3 px-2 text-sm hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
              onClick={() => onSelectCity(city.name, city.lat, city.lon)}
            >
              {city.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}