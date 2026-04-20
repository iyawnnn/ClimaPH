export interface Suggestion {
  display: string;
  lat: number;
  lng: number;
  id?: string;
  components?: any;
  place_type?: string[];
}

export type Unit = "metric" | "imperial";

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  rain?: {
    "3h": number;
  };
  clouds: {
    all: number;
  };
  pop: number;
}