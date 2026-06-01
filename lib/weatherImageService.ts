import type { CurrentWeather } from "@/types/weather";

export type WeatherVisuals = {
  condition: string;
  backgroundImage: string;
  sideImage: string;
  video: string;
  attribution: string;
};

const COMMONS_SUNSET_TIMELAPSE =
  "https://upload.wikimedia.org/wikipedia/commons/9/9d/Clouds_at_sunset_%28time_lapse%29.webm";

const unsplash = (query: string) =>
  `https://source.unsplash.com/1600x1000/?${encodeURIComponent(query)}`;

export function getWeatherVisuals(current?: CurrentWeather | null): WeatherVisuals {
  const code = current?.weatherCode ?? 2;
  const isNight = current ? !current.isDay : false;
  const rain = current?.rainChance ?? 0;
  const cloud = current?.cloudCover ?? 45;

  if (isNight) {
    return visuals("Starry Night", "starry sky mountains night", "night sky stars landscape");
  }
  if ([95, 96, 99].includes(code)) {
    return visuals("Thunderstorm", "dramatic lightning storm clouds", "storm lightning landscape");
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return visuals("Snow", "snowy mountains weather", "snow mountain sunset");
  }
  if ([45, 48].includes(code)) {
    return visuals("Fog", "misty forest fog", "foggy forest sunrise");
  }
  if (rain > 45 || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return visuals("Rain", "rainy city street weather", "rain landscape window");
  }
  if (cloud > 65 || [2, 3].includes(code)) {
    return visuals("Partly Cloudy", "dramatic cloudy sunset mountains", "sunset clouds landscape");
  }
  return visuals("Clear Sky", "blue sky mountains sunny weather", "golden hour mountain sky");
}

function visuals(condition: string, backgroundQuery: string, cardQuery: string): WeatherVisuals {
  return {
    condition,
    backgroundImage: unsplash(backgroundQuery),
    sideImage: unsplash(cardQuery),
    video: COMMONS_SUNSET_TIMELAPSE,
    attribution:
      "Animated banner video: Clouds at sunset (time lapse).webm, Wikimedia Commons, CC BY 3.0."
  };
}
