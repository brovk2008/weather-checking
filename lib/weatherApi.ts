import type {
  AirQuality,
  Coordinates,
  CurrentWeather,
  DailyWeather,
  GeocodingResult,
  HourlyWeather,
  WeatherBundle
} from "@/types/weather";

type ForecastApiResponse = {
  current: Record<string, number | string>;
  hourly: Record<string, Array<number | string>>;
  daily: Record<string, Array<number | string>>;
};

type AirQualityApiResponse = {
  hourly: Record<string, number[]>;
};

function assertNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
    name: query,
    count: "8",
    language: "en",
    format: "json"
  });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
  if (!response.ok) {
    throw new Error("Unable to search locations");
  }
  const data = (await response.json()) as { results?: Array<Record<string, unknown>> };
  return (data.results ?? []).map((place) => ({
    id: assertNumber(place.id),
    name: String(place.name ?? "Unknown"),
    admin1: typeof place.admin1 === "string" ? place.admin1 : undefined,
    country: typeof place.country === "string" ? place.country : undefined,
    latitude: assertNumber(place.latitude),
    longitude: assertNumber(place.longitude),
    timezone: typeof place.timezone === "string" ? place.timezone : undefined
  }));
}

export async function fetchWeather(location: Coordinates): Promise<WeatherBundle> {
  const forecastParams = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: "auto",
    forecast_days: "14",
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m",
    hourly:
      "temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,precipitation,rain,weather_code,pressure_msl,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,uv_index",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,precipitation_probability_max"
  });

  const airParams = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: "auto",
    forecast_days: "1",
    hourly: "us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide"
  });

  const [forecastResponse, airResponse] = await Promise.all([
    fetch(`https://api.open-meteo.com/v1/forecast?${forecastParams}`),
    fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${airParams}`)
  ]);

  if (!forecastResponse.ok || !airResponse.ok) {
    throw new Error("Unable to load weather data");
  }

  const forecast = (await forecastResponse.json()) as ForecastApiResponse;
  const air = (await airResponse.json()) as AirQualityApiResponse;
  return transformWeather(location, forecast, air);
}

function transformWeather(
  location: Coordinates,
  forecast: ForecastApiResponse,
  air: AirQualityApiResponse
): WeatherBundle {
  const currentRaw = forecast.current ?? {};
  const hourlyRaw = forecast.hourly ?? {};
  const dailyRaw = forecast.daily ?? {};
  const airRaw = air.hourly ?? {};

  const hourly: HourlyWeather[] = getArray<string>(hourlyRaw.time).slice(0, 24).map((time, index) => ({
    time,
    temperature: assertNumber(hourlyRaw.temperature_2m?.[index]),
    rainProbability: assertNumber(hourlyRaw.precipitation_probability?.[index]),
    precipitation: assertNumber(hourlyRaw.precipitation?.[index]),
    humidity: assertNumber(hourlyRaw.relative_humidity_2m?.[index]),
    windSpeed: assertNumber(hourlyRaw.wind_speed_10m?.[index]),
    uvIndex: assertNumber(hourlyRaw.uv_index?.[index]),
    cloudCover: assertNumber(hourlyRaw.cloud_cover?.[index])
  }));

  const daily: DailyWeather[] = getArray<string>(dailyRaw.time).slice(0, 14).map((date, index) => ({
    date,
    temperatureMax: assertNumber(dailyRaw.temperature_2m_max?.[index]),
    temperatureMin: assertNumber(dailyRaw.temperature_2m_min?.[index]),
    rainProbability: assertNumber(dailyRaw.precipitation_probability_max?.[index]),
    precipitation: assertNumber(dailyRaw.precipitation_sum?.[index]),
    uvIndex: assertNumber(dailyRaw.uv_index_max?.[index]),
    sunrise: String(dailyRaw.sunrise?.[index] ?? ""),
    sunset: String(dailyRaw.sunset?.[index] ?? ""),
    weatherCode: assertNumber(dailyRaw.weather_code?.[index])
  }));

  const firstDaily = daily[0];
  const current: CurrentWeather = {
    temperature: assertNumber(currentRaw.temperature_2m),
    feelsLike: assertNumber(currentRaw.apparent_temperature),
    humidity: assertNumber(currentRaw.relative_humidity_2m),
    windSpeed: assertNumber(currentRaw.wind_speed_10m),
    windDirection: assertNumber(currentRaw.wind_direction_10m),
    visibility: assertNumber(hourlyRaw.visibility?.[0]) / 1000,
    pressure: assertNumber(currentRaw.pressure_msl),
    dewPoint: assertNumber(hourlyRaw.dew_point_2m?.[0]),
    cloudCover: assertNumber(currentRaw.cloud_cover),
    rainChance: assertNumber(hourlyRaw.precipitation_probability?.[0]),
    rainAmount: assertNumber(currentRaw.rain) || assertNumber(currentRaw.precipitation),
    uvIndex: assertNumber(hourlyRaw.uv_index?.[0]),
    sunrise: firstDaily?.sunrise ?? "",
    sunset: firstDaily?.sunset ?? "",
    isDay: assertNumber(currentRaw.is_day) === 1,
    weatherCode: assertNumber(currentRaw.weather_code)
  };

  const airQuality: AirQuality = {
    aqi: assertNumber(airRaw.us_aqi?.[0]),
    pm25: assertNumber(airRaw.pm2_5?.[0]),
    pm10: assertNumber(airRaw.pm10?.[0]),
    carbonMonoxide: assertNumber(airRaw.carbon_monoxide?.[0]),
    nitrogenDioxide: assertNumber(airRaw.nitrogen_dioxide?.[0])
  };

  return { location, current, hourly, daily, airQuality };
}
