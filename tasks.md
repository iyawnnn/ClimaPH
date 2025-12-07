# CLIMAPH Tasks

## Project Setup
1. Initialize Next.js project with TypeScript (DONE)
2. Configure Tailwind CSS and ShadCN UI component library (DONE)
3. Set up environment variables for API keys (`NEXT_PUBLIC_OWM_API_KEY`) (DONE)
4. Configure ESLint and Prettier for consistent code quality and formatting (DONE)
5. Set up Git repository with proper branching strategy (`main` for production, `dev` for development) (DONE)
6. Create documentation folders for project planning, architecture, and feature specifications (DONE)

## API Integration
7. Set up Next.js API routes to act as proxy endpoints for OpenWeatherMap (DONE)
8. Fetch current weather for Philippine cities and provinces (DONE)
9. Fetch 5-day 3 hour forecast data (DONE) 
10. Optional: fetch hourly forecast and air quality index (N/A)
11. Implement secure storage and usage of API keys via `.env.local` (DONE)
12. Plan caching strategy to reduce API calls: (DONE)
    - Current weather cached 5–10 minutes
    - Forecast cached 1–2 hours
13. Document all API endpoints used, including request parameters and response structures

## UI & UX Design
14. Design a responsive, mobile-first dashboard layout (DONE)
15. Create **current weather cards** displaying:
    - Temperature
    - Humidity
    - Wind speed/direction
    - Rainfall
    - Weather icon
16. Create **forecast cards** (daily/hourly) with interactive hover details
17. Integrate charts (using Recharts or Chart.js) for:
    - Temperature trends
    - Rainfall patterns
    - Wind speed/direction
18. Add search functionality: (DONE)
    - Search by city, province, or region
    - Autocomplete suggestions for faster input
19. Interactive Weather Map:
    - Users can click on regions (cities, provinces) to view weather
    - Color-coded heatmap for temperature or rainfall

## Advanced Features & Creative Twists
20. Implement climate trends graphs comparing historical vs current weather
21. Implement local alerts/notifications for extreme weather events (rain, storms, high temperature)
22. Implement favorites & user profiles for saving preferred locations
23. Add gamification: badges or rewards for checking multiple regions or logging daily weather
24. Add dark/light mode toggle
25. Add temperature and unit switcher (°C/°F, km/h or mph for wind)
26. Optional: display additional info per location:
    - Sunrise/sunset
    - UV index
    - Moon phase

## Data Management & Caching
27. Implement caching for API responses (Next.js ISR, Vercel KV, or Redis)
28. Implement error handling for API failures or rate limits
29. Display fallback UI if data fails to load
30. Document caching strategy, refresh intervals, and fallback behavior

## Testing & Quality Assurance
31. Test all components for responsiveness (desktop, tablet, mobile)
32. Validate API calls, data parsing, and caching behavior
33. Implement unit tests for critical functions (Jest or Vitest)
34. Conduct end-to-end tests for key flows (search, display weather, forecast, charts)
35. Test accessibility (Lighthouse or similar tools)
36. Document all test cases and outcomes

## Deployment & Monitoring
37. Deploy CLIMAPH on Vercel with environment variables properly configured
38. Set up a custom domain (optional)
39. Enable analytics (Vercel Analytics or Google Analytics) for user interaction tracking
40. Monitor API usage and caching efficiency
41. Document deployment steps and rollback procedures

## Documentation & Project Management
42. Maintain `README.md` with:
    - Project overview
    - Setup instructions
    - Usage guide
43. Create `architecture.md` detailing:
    - API flows
    - Folder structure
    - Caching mechanisms
    - Data sources
44. Create `feature-list.md` documenting each feature, including optional/advanced twists
45. Track all tasks in `tasks.md` (this file)
46. Maintain a changelog for each release or significant update

## Optional Enhancements (Post-MVP)
47. Interactive weather alerts map for the Philippines (storm or typhoon visualization)
48. Compare multiple cities side-by-side (temperature, rainfall, wind)
49. Historical climate data graphs per province (trend analysis)
50. Advanced gamification: badges, levels, or points for consistent usage
51. Community features: allow users to submit local weather observations
