# UI Components

ClimaPH uses **ShadCN UI components** and TailwindCSS for a modern and consistent design.

## Core Components

- **Button** – Clickable buttons for actions (e.g., search, toggle units).  
- **Card** – Displays weather information for a city.  
- **Input / SearchBar** – Text input for entering city names.  
- **ToggleSwitch** – For settings like dark mode and temperature unit.  
- **DropdownMenu** – Optional, for selecting from search history.

## Design Guidelines

- Keep spacing consistent between elements using Tailwind classes.  
- Use variant system for buttons (`outline`, `ghost`, `secondary`, `destructive`).  
- Make all components responsive and mobile-friendly.  
- Icons from **Lucide React** can be used inside buttons and cards.

## Notes 

- Components should be reusable and modular.  
- Use `@/components/ui` as the default import path for all UI components.