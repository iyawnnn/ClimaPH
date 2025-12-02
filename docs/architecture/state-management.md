# State Management

ClimaPH uses **React state** to manage app data.  

## Key State Variables

- `weatherData` – Stores current weather data for the selected city.  
- `searchHistory` – Stores recently searched cities.  
- `temperatureUnit` – Tracks whether the user selected Celsius or Fahrenheit.  
- `darkMode` – Tracks theme preference (light/dark).

## Recommended Approach

- Use **React `useState` and `useEffect`** for basic state management.  
- For larger state needs, consider **Zustand** or **React Context API**.  
- Persist settings and history in **localStorage** to maintain state between sessions.

## Example

```ts
const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
const [searchHistory, setSearchHistory] = useState<string[]>([]);
const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
const [darkMode, setDarkMode] = useState(false);
```

Notes

- Keep state modular and only store what's necessary.
- Avoid prop drilling by using context or hooks where needed.