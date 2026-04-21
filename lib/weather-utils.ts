export function calculateAQI(pm25: number): number {
  const breakpoints = [
    [0.0, 12.0, 0, 50],
    [12.1, 35.4, 51, 100],
    [35.5, 55.4, 101, 150],
    [55.5, 150.4, 151, 200],
    [150.5, 250.4, 201, 300],
    [250.5, 350.4, 301, 400],
    [350.5, 500.4, 401, 500]
  ];

  // Identifies the correct piecewise linear breakpoint bracket for the raw PM2.5 value
  const bp = breakpoints.find(b => pm25 >= b[0] && pm25 <= b[1]);
  if (!bp) return pm25 > 500.4 ? 500 : 0;

  const [cLow, cHigh, iLow, iHigh] = bp;
  return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (pm25 - cLow) + iLow);
}

export function getWindDirection(degrees: number): string {
  const directions = [
    'North', 'North-Northeast', 'Northeast', 'East-Northeast',
    'East', 'East-Southeast', 'Southeast', 'South-Southeast',
    'South', 'South-Southwest', 'Southwest', 'West-Southwest',
    'West', 'West-Northwest', 'Northwest', 'North-Northwest'
  ];
  
  const index = Math.round(degrees / 22.5) % 16;
  return `${directions[index]} Wind`;
}