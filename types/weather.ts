export type ThemeName = "dark" | "light" | "midnight" | "cyber" | "glass";

export type Coordinates = {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
  admin1?: string;
};

export type GeocodingResult = Coordinates & {
  id: number;
  timezone?: string;
};

export type CurrentWeather = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  pressure: number;
  dewPoint: number;
  cloudCover: number;
  rainChance: number;
  rainAmount: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  isDay: boolean;
  weatherCode: number;
};

export type HourlyWeather = {
  time: string;
  temperature: number;
  rainProbability: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  cloudCover: number;
};

export type DailyWeather = {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  rainProbability: number;
  precipitation: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  weatherCode: number;
};

export type AirQuality = {
  aqi: number;
  pm25: number;
  pm10: number;
  carbonMonoxide: number;
  nitrogenDioxide: number;
};

export type WeatherBundle = {
  location: Coordinates;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  airQuality: AirQuality;
};

export type AlertType = "Heavy Rain" | "Storm" | "High UV" | "Strong Winds" | "Extreme Temperature";

export type WeatherAlert = {
  type: AlertType;
  severity: "Advisory" | "Watch" | "Warning";
  message: string;
};

export type ActivityScore = {
  name: string;
  score: number;
  detail: string;
};
