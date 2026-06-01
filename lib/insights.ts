import type { ActivityScore, WeatherAlert, WeatherBundle } from "@/types/weather";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function generateInsights(weather: WeatherBundle) {
  const eveningRain = weather.hourly.slice(16, 22).some((hour) => hour.rainProbability >= 55);
  const windPeak = Math.max(...weather.hourly.map((hour) => hour.windSpeed), 0);
  const bestOutdoorHour = weather.hourly.find(
    (hour) => hour.rainProbability < 30 && hour.uvIndex < 7 && hour.windSpeed < 25
  );
  const insights = [
    eveningRain
      ? "Rain is likely during evening hours."
      : "Evening rainfall risk is currently limited.",
    windPeak >= 35
      ? "Strong winds are expected later in the forecast window."
      : "Wind conditions remain manageable for most outdoor plans.",
    bestOutdoorHour
      ? `Outdoor activities look best near ${formatHour(bestOutdoorHour.time)}.`
      : "Outdoor activity windows are limited by current weather risk.",
    weather.current.cloudCover < 45
      ? "Sky visibility supports photography and stargazing planning."
      : "Cloud coverage may reduce sky visibility and photo contrast."
  ];
  return insights;
}

export function generateAlerts(weather: WeatherBundle): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const maxRain = Math.max(...weather.hourly.map((hour) => hour.precipitation), 0);
  const maxRainChance = Math.max(...weather.hourly.map((hour) => hour.rainProbability), 0);
  const maxWind = Math.max(...weather.hourly.map((hour) => hour.windSpeed), 0);
  const maxUv = Math.max(...weather.hourly.map((hour) => hour.uvIndex), 0);
  const temp = weather.current.temperature;

  if (maxRain >= 10 || maxRainChance >= 85) {
    alerts.push({ type: "Heavy Rain", severity: "Warning", message: "Heavy rain risk is elevated within 24 hours." });
  }
  if (maxRainChance >= 70 && maxWind >= 40) {
    alerts.push({ type: "Storm", severity: "Watch", message: "Storm conditions may develop when rain and wind align." });
  }
  if (maxUv >= 8) {
    alerts.push({ type: "High UV", severity: "Advisory", message: "UV exposure is high. Prefer shade near midday." });
  }
  if (maxWind >= 38) {
    alerts.push({ type: "Strong Winds", severity: "Watch", message: "Strong gust potential may affect drones and cycling." });
  }
  if (temp >= 38 || temp <= 0) {
    alerts.push({
      type: "Extreme Temperature",
      severity: "Advisory",
      message: "Temperature is outside comfortable outdoor ranges."
    });
  }
  return alerts;
}

export function calculateActivityScores(weather: WeatherBundle): ActivityScore[] {
  const current = weather.current;
  const rainPenalty = current.rainChance * 0.55 + current.rainAmount * 5;
  const windPenalty = current.windSpeed * 0.8;
  const heatPenalty = Math.abs(current.temperature - 22) * 2;
  const cloudBonus = 100 - Math.abs(current.cloudCover - 35);

  return [
    score("Walking", 100 - rainPenalty - heatPenalty * 0.6 - windPenalty * 0.4, "Comfort, rain risk, and wind exposure."),
    score("Cycling", 100 - rainPenalty - windPenalty * 1.2 - heatPenalty * 0.5, "Wind stability and dry pavement preference."),
    score("Running", 100 - rainPenalty - heatPenalty * 0.9 - current.humidity * 0.18, "Heat stress, humidity, and precipitation."),
    score("Photography", cloudBonus - current.rainChance * 0.35, "Cloud texture, visibility, and dry gear conditions."),
    score("Picnic Score", 100 - rainPenalty - windPenalty - heatPenalty * 0.5, "Dry ground, mild temperature, and low wind."),
    score("Drone Flying Score", 100 - windPenalty * 1.8 - current.rainChance * 0.7 - current.cloudCover * 0.2, "Low wind, visibility, and rain avoidance."),
    score("Stargazing Score", 100 - current.cloudCover * 0.9 - current.humidity * 0.25 - current.rainChance * 0.5, "Clear sky and lower humidity."),
    score("Solar Charging Score", 100 - current.cloudCover * 0.7 - current.rainChance * 0.25 + current.uvIndex * 3, "Sun intensity and cloud cover."),
    score("Laundry Drying Score", 100 - current.humidity * 0.55 - current.rainChance * 0.7 + current.windSpeed * 0.45, "Dry air and airflow."),
    score("Robotics Testing Score", 100 - rainPenalty - windPenalty * 0.8 - Math.max(0, current.temperature - 34) * 3, "Sensor reliability and safe outdoor testing.")
  ];
}

function score(name: string, value: number, detail: string): ActivityScore {
  return { name, score: clamp(value), detail };
}

function formatHour(value: string) {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function getRainRisk(probability: number, rainAmount: number) {
  if (probability >= 85 || rainAmount >= 12) return "Storm Risk";
  if (probability >= 65 || rainAmount >= 6) return "High Risk";
  if (probability >= 35 || rainAmount >= 1) return "Medium Risk";
  return "Low Risk";
}
