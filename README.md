# ClimaPH – Advanced Weather Forecasting Platform

ClimaPH is a high-performance weather forecasting application built using the Next.js ecosystem. It provides a unified platform for users to monitor real-time weather, 12-hour temperature trends, and 5-day extended outlooks for any location in the Philippines and beyond. The platform integrates practical "Lifestyle" metrics like laundry and umbrella guides into a single system, supporting geolocation, search history, and personalized favorite locations. ClimaPH is designed for travelers, commuters, and individuals looking for structured environmental guidance to maintain their daily routines.

## Tech Stack

### Frontend & UI

- **Framework & State Management:** Next.js 15+ (App Router), React 19
- **Styling & Components:** Tailwind CSS, Shadcn UI, Radix UI
- **Icons & Animation:** Lucide React, Framer Motion, Tailwind Animate
- **Build Tool:** Turbopack (Next.js 15 default)
- **Charts & Visualization:** Recharts (Area Charts with Linear Gradients)
- **Maps:** Leaflet, React-Leaflet
- **Notifications:** Sonner

### Backend & API

- **Runtime & API:** Next.js Route Handlers (Serverless)
- **Weather Services:** OpenWeatherMap API (Current, Hourly, & Forecast)
- **Geocoding Services:** OpenCage Data API
- **Type Safety:** TypeScript
- **Environment Variables:** .env.local management
- **Deployment:** Vercel

## Core Features

### Location & Search

- Real-time city and province search
- Automatic geolocation detection
- Favorite locations management with persistent local storage
- Recent search history tracking

### Weather Modules

- Real Feel temperature status with color-coded alerts (e.g., Red for Hot, Green for Comfortable)
- Interactive 12-hour temperature trend charts with smooth interpolation
- 5-day extended forecast with high/low temperature predictions
- Detailed humidity, wind speed, and dew point metrics

### Lifestyle Insights

- Smart Laundry Guide (Sampay Meter) based on cloud cover and rain probability
- Umbrella Check for rain protection or UV sun shielding recommendations
- Interactive map layers for temperature, clouds, and wind patterns

### Integrated System

- Unified platform combining geographic and meteorological metrics
- Professional dark-mode first architecture
- Responsive and consistent user interface for mobile and desktop

## Development Workflow

### 1. Planning & Architecture

- Defined custom hooks (useWeather) for centralized state management
- Designed component-based architecture for modular UI development
- Outlined data transformation logic to group 3-hour interval API data into daily summaries

### 2. Implementation

- Built RESTful Route Handlers to securely manage API calls
- Integrated interactive maps with custom marker logic
- Implemented strict TypeScript interfaces for all API responses and component props
- Developed dynamic charts with mobile-responsive tick scaling

### 3. Testing & Refinement

- Tested API endpoints and error responses across different browser environments
- Resolved CORS and state management issues
- Optimized build process by resolving TypeScript "Implicit Any" and library type definitions

## Key Takeaways

- Developed a professional Next.js application from end-to-end
- Implemented secure API communication using environment variables
- Built complex data transformation logic for weather interval mapping
- Integrated mapping and charting libraries for high-level data visualization
- Managed professional branch merging and pull request workflows (dev to main)
- Applied strict TypeScript practices to ensure production build stability
- Designed a mobile-first responsive layout with modern UI utilities

## Installation Instructions

### 1. Clone the Repository

```bash
git clone [https://github.com/iyawnnn/ClimaPH.git](https://github.com/iyawnnn/ClimaPH.git)
cd ClimaPH
```

### 2. Install Project Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a .env.local file in the root directory and fill up the following:

```bash
# Client-side API keys
NEXT_PUBLIC_OWM_API_KEY=your_openweathermap_key
NEXT_PUBLIC_OPENCAGE_API_KEY=your_opencage_key

# Server-side API keys
OPENWEATHER_API_KEY=your_openweathermap_key
OPENCAGE_API_KEY=your_opencage_key
```

## Running the Application

1. Make sure your cloud API keys are properly configured in the .env.local file.

2. Start the development server:

```bash
npm run dev
```

3. Open your web browser and navigate to the local URL (default: http://localhost:3000) to access the application.

4. Search for a location or click the "current location" icon to see real-time data and lifestyle insights.

## Usage
- Search for your city or province using the search bar.

- Save your most visited cities to the "Favorites" list for one-click access.

- Use the "Lifestyle Grid" to check if it is a good time to do laundry or bring an umbrella.

- Interact with the weather map to see regional temperature or wind patterns.