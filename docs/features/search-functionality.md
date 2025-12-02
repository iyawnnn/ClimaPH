# Search Functionality

ClimaPH allows users to search for cities to fetch real-time weather data.

## Features

- Search bar for entering city names.  
- Autocomplete suggestions (optional future enhancement).  
- Displays error messages for invalid or unrecognized cities.  
- Updates the Weather Dashboard with search results.

## Components

- **SearchBar** – Input field with search button.  
- **SearchHistoryDropdown** – Optional dropdown showing previously searched cities.  

## Notes

- Ensure search is debounced to prevent excessive API calls.  
- Consider caching search results to improve performance.
