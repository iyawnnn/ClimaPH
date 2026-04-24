export interface Suggestion {
  lat: number;
  lon?: number;
  lng?: number;
  longitude?: number;
  display?: string;
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