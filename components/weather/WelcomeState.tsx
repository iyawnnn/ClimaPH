import { Navigation, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type WelcomeStateProps = {
  onUseLocation: () => void;
  onSelectCity: (city: string, lat: number, lon: number) => void;
};

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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function WelcomeState({ onUseLocation, onSelectCity }: WelcomeStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[65vh] w-full"
    >
      <div className="w-full max-w-xl flex flex-col items-center gap-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <MapPin className="h-6 w-6" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            ClimaPH
          </h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            Select a location to retrieve high-fidelity meteorological data and system forecasts.
          </p>
        </div>

        {/* Primary Action */}
        <Button 
          size="lg" 
          className="w-full sm:w-auto px-8 rounded-2xl shadow-sm transition-all duration-300 h-12"
          onClick={onUseLocation}
        >
          <Navigation className="h-4 w-4 mr-2" />
          Use Current Location
        </Button>

        {/* Node Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full pt-6 border-t border-border/50"
        >
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-5 text-center">
            Or select a frequent node
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {POPULAR_CITIES.map((city) => (
              <motion.div key={city.name} variants={itemVariants}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-medium border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors duration-200"
                  onClick={() => onSelectCity(city.name, city.lat, city.lon)}
                >
                  {city.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}