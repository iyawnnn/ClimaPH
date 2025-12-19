export interface Suggestion {
  display: string;
  lat: number;
  lng: number;
  id?: string;
  components?: any;
  place_type?: string[];
}
export type Unit = "metric" | "imperial";
