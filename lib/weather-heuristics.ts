import { isWithinInterval, setHours, startOfDay } from "date-fns";
import type { ForecastItem } from "@/types/types";

export function calculateCommuterRisk(forecastList: ForecastItem[]): {
  riskLevel: "Low" | "Moderate" | "High" | "Extreme";
  probability: number;
  primaryFactor: string;
} {
  if (!forecastList || !forecastList.length) {
    return { riskLevel: "Low", probability: 0, primaryFactor: "Awaiting Data" };
  }

  const today = new Date();
  const morningCommuteStart = setHours(startOfDay(today), 5);
  const morningCommuteEnd = setHours(startOfDay(today), 9);

  const commuteForecasts = forecastList.filter((item) => {
    const itemDate = new Date(item.dt * 1000);
    return isWithinInterval(itemDate, {
      start: morningCommuteStart,
      end: morningCommuteEnd,
    });
  });

  if (!commuteForecasts.length) {
    return { riskLevel: "Low", probability: 0, primaryFactor: "Clear" };
  }

  let maxRain = 0;
  let maxWind = 0;
  let maxTemp = 0;

  commuteForecasts.forEach((item) => {
    if (item.rain?.["3h"] && item.rain["3h"] > maxRain) {
      maxRain = item.rain["3h"];
    }
    if (item.wind?.speed && item.wind.speed > maxWind) {
      maxWind = item.wind.speed;
    }
    if (item.main?.temp_max && item.main.temp_max > maxTemp) {
      maxTemp = item.main.temp_max;
    }
  });

  let probability = 0;
  let primaryFactor = "Normal Conditions";

  if (maxRain > 15) {
    probability += 60;
    primaryFactor = "Heavy Rainfall";
  } else if (maxRain > 5) {
    probability += 30;
    primaryFactor = "Moderate Rain";
  }

  if (maxWind > 15) {
    probability += 30;
    primaryFactor = "Strong Winds";
  }

  if (maxTemp > 40) {
    probability += 40;
    primaryFactor = "Extreme Heat Index";
  }

  probability = Math.min(probability, 100);

  let riskLevel: "Low" | "Moderate" | "High" | "Extreme" = "Low";
  if (probability >= 80) riskLevel = "Extreme";
  else if (probability >= 50) riskLevel = "High";
  else if (probability >= 20) riskLevel = "Moderate";

  return { riskLevel, probability, primaryFactor };
}

export function calculateDailyNecessities(forecastList: ForecastItem[]): {
  needsUmbrella: boolean;
  umbrellaReason: string;
  canDoLaundry: boolean;
  laundryReason: string;
} {
  if (!forecastList || !forecastList.length) {
    return {
      needsUmbrella: false,
      umbrellaReason: "Awaiting data",
      canDoLaundry: false,
      laundryReason: "Awaiting data",
    };
  }

  const today = new Date();
  const endOfDayTime = setHours(startOfDay(today), 23);

  // Filter for the remaining forecast blocks for today
  const todaysForecasts = forecastList.filter((item) => {
    const itemDate = new Date(item.dt * 1000);
    return itemDate <= endOfDayTime && itemDate >= today;
  });

  // 1. Umbrella Logic: Check for significant rain probability or actual volume today
  let maxPop = 0;
  let totalRain = 0;

  todaysForecasts.forEach((item) => {
    if (item.pop > maxPop) maxPop = item.pop;
    if (item.rain?.["3h"]) totalRain += item.rain["3h"];
  });

  // >40% chance of precipitation or more than 1mm of cumulative rain
  const needsUmbrella = maxPop > 0.4 || totalRain > 1;
  const umbrellaReason = needsUmbrella
    ? totalRain > 1
      ? "Rainfall expected today."
      : "High probability of rain."
    : "Clear skies expected.";

  // 2. Laundry Logic: Check conditions strictly between 8 AM and 4 PM
  const laundryStart = setHours(startOfDay(today), 8);
  const laundryEnd = setHours(startOfDay(today), 16);

  const laundryHours = forecastList.filter((item) => {
    const itemDate = new Date(item.dt * 1000);
    return isWithinInterval(itemDate, { start: laundryStart, end: laundryEnd });
  });

  let avgHumidity = 0;
  let willRainDuringLaundry = false;

  if (laundryHours.length > 0) {
    laundryHours.forEach((item) => {
      avgHumidity += item.main.humidity;
      if (item.pop > 0.3 || (item.rain?.["3h"] && item.rain["3h"] > 0.5)) {
        willRainDuringLaundry = true;
      }
    });
    avgHumidity = avgHumidity / laundryHours.length;
  }

  let canDoLaundry = false;
  let laundryReason = "Prime laundry hours have passed.";

  if (laundryHours.length > 0) {
    canDoLaundry = !willRainDuringLaundry && avgHumidity < 85;
    if (canDoLaundry) {
      laundryReason = "Good drying conditions.";
    } else if (willRainDuringLaundry) {
      laundryReason = "Rain expected during prime hours.";
    } else if (avgHumidity >= 85) {
      laundryReason = "Too humid to dry clothes outside.";
    }
  }

  return { needsUmbrella, umbrellaReason, canDoLaundry, laundryReason };
}