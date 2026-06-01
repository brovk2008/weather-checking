"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Cloud,
  Compass,
  Droplets,
  Eye,
  Gauge,
  Map,
  Moon,
  Navigation,
  ShieldCheck,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Umbrella,
  Wind
} from "lucide-react";
import { DashboardCharts } from "@/components/DashboardCharts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GaugeGrid } from "@/components/GaugeGrid";
import { SearchBox } from "@/components/SearchBox";
import { StatCard } from "@/components/StatCard";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { WeatherJournal } from "@/components/WeatherJournal";
import { calculateActivityScores, generateAlerts, generateInsights, getRainRisk } from "@/lib/insights";
import { fetchWeather, searchLocations } from "@/lib/weatherApi";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Coordinates, GeocodingResult, ThemeName, WeatherBundle } from "@/types/weather";

const WeatherMap = dynamic(() => import("@/components/WeatherMap").then((module) => module.WeatherMap), {
  ssr: false,
  loading: () => <div className="glass-card grid min-h-[520px] place-items-center rounded-[2rem]">Loading map</div>
});

const defaultLocation: Coordinates = {
  name: "New Delhi",
  country: "India",
  admin1: "Delhi",
  latitude: 28.6139,
  longitude: 77.209
};

export default function Home() {
  const [theme, setTheme] = useLocalStorage<ThemeName>("weather-checking-theme", "dark");
  const [recent, setRecent] = useLocalStorage<GeocodingResult[]>("weather-checking-recent", []);
  const [favorites, setFavorites] = useLocalStorage<GeocodingResult[]>("weather-checking-favorites", []);
  const [location, setLocation] = useState<Coordinates>(defaultLocation);
  const [weather, setWeather] = useState<WeatherBundle | null>(null);
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [status, setStatus] = useState("Loading weather intelligence");
  const [mapStyle, setMapStyle] = useState<"Standard" | "Dark" | "Satellite">("Dark");
  const [highContrast, setHighContrast] = useLocalStorage("weather-checking-contrast", false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    const permissionAsked = localStorage.getItem("weather-checking-location-asked");
    if (!permissionAsked && "geolocation" in navigator) {
      localStorage.setItem("weather-checking-location-asked", "true");
      const allow = window.confirm("Allow location access for local weather?");
      if (allow) {
        detectLocation();
        return;
      }
    }
    loadWeather(defaultLocation);
  }, []);

  const insights = useMemo(() => (weather ? generateInsights(weather) : []), [weather]);
  const alerts = useMemo(() => (weather ? generateAlerts(weather) : []), [weather]);
  const scores = useMemo(() => (weather ? calculateActivityScores(weather) : []), [weather]);

  async function loadWeather(nextLocation: Coordinates) {
    try {
      setStatus(`Loading weather for ${nextLocation.name}`);
      setLocation(nextLocation);
      const bundle = await fetchWeather(nextLocation);
      setWeather(bundle);
      setStatus("Weather intelligence updated");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to load weather");
    }
  }

  async function handleSearch(query: string) {
    try {
      setStatus("Searching locations");
      setResults(await searchLocations(query));
      setStatus("Select a location");
    } catch {
      setStatus("Location search failed");
    }
  }

  function selectLocation(place: GeocodingResult) {
    setRecent([place, ...recent.filter((item) => item.id !== place.id)].slice(0, 8));
    setResults([]);
    loadWeather(place);
  }

  function toggleFavorite(place: GeocodingResult) {
    const exists = favorites.some((item) => item.id === place.id);
    setFavorites(exists ? favorites.filter((item) => item.id !== place.id) : [place, ...favorites].slice(0, 12));
  }

  function detectLocation() {
    if (!("geolocation" in navigator)) {
      setStatus("Geolocation is not available in this browser");
      return;
    }
    setStatus("Requesting local coordinates");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        loadWeather({
          name: "Current Location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => setStatus("Location permission denied. Search for a city instead."),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  return (
    <main className={highContrast ? "app-shell high-contrast" : "app-shell"}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="accent-gradient rounded-2xl p-3 text-slate-950">
            <Cloud aria-hidden="true" />
          </span>
          <span>
            <span className="block text-xl font-bold">Weather Checking</span>
            <span className="text-muted text-sm">Premium Open-Meteo weather intelligence</span>
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setHighContrast(!highContrast)} className="solid-card flex items-center gap-2 rounded-full px-4 py-3">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            High contrast
          </button>
          <ThemeSwitcher theme={theme} onThemeChange={setTheme} />
        </div>
      </div>

      <ErrorBoundary>
        <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass-card relative overflow-hidden rounded-[2.5rem] p-8">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute left-10 top-10 h-48 w-48 rounded-full bg-cyan-300 blur-3xl" />
              <div className="absolute bottom-8 right-12 h-56 w-56 rounded-full bg-violet-400 blur-3xl" />
            </div>
            <div className="relative">
              <p className="text-muted text-sm uppercase tracking-[0.32em]">Live weather command center</p>
              <h1 className="mt-4 max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
                Forecasts, rain risk, maps, and activity scores in one premium dashboard.
              </h1>
              <p className="text-muted mt-5 max-w-2xl text-lg">
                Built on Open-Meteo with local insights, privacy-first storage, responsive design, and no external AI APIs.
              </p>
              <div className="mt-8">
                <SearchBox
                  onSearch={handleSearch}
                  onSelect={selectLocation}
                  onLocate={detectLocation}
                  results={results}
                  recent={recent}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
              <p className="text-muted mt-4" aria-live="polite">{status}</p>
            </div>
          </motion.div>

          <CurrentWeatherCard weather={weather} location={location} />
        </section>

        {weather ? (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Thermometer} label="Feels Like" value={`${Math.round(weather.current.feelsLike)}°C`} detail="Apparent temperature adjusted for humidity and wind." />
              <StatCard icon={Droplets} label="Humidity" value={`${weather.current.humidity}%`} detail="Relative humidity at two meters above ground." />
              <StatCard icon={Wind} label="Wind" value={`${Math.round(weather.current.windSpeed)} km/h`} detail={`${weather.current.windDirection}° directional flow.`} />
              <StatCard icon={Umbrella} label="Rain Chance" value={`${weather.current.rainChance}%`} detail={`${weather.current.rainAmount} mm measured precipitation.`} />
              <StatCard icon={Eye} label="Visibility" value={`${weather.current.visibility.toFixed(1)} km`} detail="Near-surface visibility from hourly model data." />
              <StatCard icon={Gauge} label="Pressure" value={`${Math.round(weather.current.pressure)} hPa`} detail="Mean sea level pressure estimate." />
              <StatCard icon={Cloud} label="Cloud Cover" value={`${weather.current.cloudCover}%`} detail="Total sky coverage for local conditions." />
              <StatCard icon={Sun} label="UV Index" value={`${weather.current.uvIndex.toFixed(1)}`} detail="Peak sun exposure guidance for planning." />
            </section>

            <FeatureGrid />
            <RainPrediction weather={weather} />
            <Forecasts weather={weather} />
            <DashboardCharts hourly={weather.hourly} />
            <WeatherMap location={weather.location} mapStyle={mapStyle} onStyleChange={setMapStyle} />
            <InsightsAlerts insights={insights} alerts={alerts} />
            <AirAstronomy weather={weather} />
            <GaugeGrid scores={scores} />
            <PlanningTools weather={weather} />
            <WeatherJournal />
          </>
        ) : null}
      </ErrorBoundary>

      <Footer />
    </main>
  );
}

function CurrentWeatherCard({ weather, location }: { weather: WeatherBundle | null; location: Coordinates }) {
  return (
    <motion.aside initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass-card rounded-[2.5rem] p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted text-sm">Current weather</p>
          <h2 className="text-3xl font-semibold">{location.name}</h2>
          <p className="text-muted">{[location.admin1, location.country].filter(Boolean).join(", ")}</p>
        </div>
        {weather?.current.isDay ? <Sun className="h-10 w-10" aria-hidden="true" /> : <Moon className="h-10 w-10" aria-hidden="true" />}
      </div>
      <div className="my-10">
        <p className="text-8xl font-bold">{weather ? Math.round(weather.current.temperature) : "--"}°</p>
        <p className="text-muted mt-3">Dew point {weather ? Math.round(weather.current.dewPoint) : "--"}°C</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MiniMetric icon={Sunrise} label="Sunrise" value={weather ? formatTime(weather.current.sunrise) : "--"} />
        <MiniMetric icon={Sunset} label="Sunset" value={weather ? formatTime(weather.current.sunset) : "--"} />
        <MiniMetric icon={Navigation} label="Wind Dir" value={weather ? `${weather.current.windDirection}°` : "--"} />
        <MiniMetric icon={Map} label="Weather Code" value={weather ? String(weather.current.weatherCode) : "--"} />
      </div>
    </motion.aside>
  );
}

function MiniMetric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="solid-card rounded-2xl p-4">
      <Icon className="mb-3 h-5 w-5" aria-hidden="true" />
      <p className="text-muted text-sm">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function FeatureGrid() {
  const features = [
    ["Rain Prediction", Umbrella],
    ["Hourly Forecasts", Compass],
    ["Weather Radar", Map],
    ["Air Quality", Wind],
    ["UV Index", Sun],
    ["Sunrise/Sunset", Sunrise],
    ["Wind Analytics", Activity]
  ] as const;
  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {features.map(([label, Icon]) => (
        <article key={label} className="glass-card rounded-[1.5rem] p-5">
          <Icon className="mb-4 h-6 w-6" aria-hidden="true" />
          <h3 className="font-semibold">{label}</h3>
          <p className="text-muted mt-2 text-sm">Responsive premium module included in the dashboard.</p>
        </article>
      ))}
    </section>
  );
}

function RainPrediction({ weather }: { weather: WeatherBundle }) {
  const risk = getRainRisk(weather.current.rainChance, weather.current.rainAmount);
  const maxRain = Math.max(...weather.hourly.map((hour) => hour.precipitation));
  const confidence = Math.min(98, Math.round(55 + weather.current.rainChance * 0.35 + maxRain * 2));
  return (
    <section className="glass-card mt-6 rounded-[2rem] p-6">
      <p className="text-muted text-sm">Rain prediction center</p>
      <h2 className="text-2xl font-semibold">Risk level: {risk}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <StatCard icon={Umbrella} label="Probability" value={`${weather.current.rainChance}%`} detail="Nearest-hour model probability." />
        <StatCard icon={Droplets} label="Expected Rainfall" value={`${maxRain.toFixed(1)} mm`} detail="Maximum hourly precipitation." />
        <StatCard icon={Gauge} label="Intensity" value={maxRain > 8 ? "Heavy" : maxRain > 2 ? "Moderate" : "Light"} detail="Classified from precipitation rate." />
        <StatCard icon={ShieldCheck} label="Confidence" value={`${confidence}%`} detail="Local heuristic from rain agreement." />
      </div>
      <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
        {weather.hourly.slice(0, 12).map((hour) => (
          <div key={hour.time} className="solid-card min-w-32 rounded-2xl p-4">
            <p className="text-sm font-semibold">{formatTime(hour.time)}</p>
            <p className="mt-2 text-2xl">{hour.rainProbability}%</p>
            <p className="text-muted text-sm">{hour.precipitation} mm</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Forecasts({ weather }: { weather: WeatherBundle }) {
  return (
    <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      <div className="glass-card rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold">24-hour forecast</h2>
        <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
          {weather.hourly.map((hour) => (
            <article key={hour.time} className="solid-card min-w-36 rounded-2xl p-4">
              <p className="text-muted text-sm">{formatTime(hour.time)}</p>
              <p className="mt-2 text-3xl font-semibold">{Math.round(hour.temperature)}°</p>
              <p className="text-muted text-sm">{hour.rainProbability}% rain</p>
            </article>
          ))}
        </div>
      </div>
      <div className="glass-card rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold">14-day daily and weekly forecast</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {weather.daily.map((day) => (
            <article key={day.date} className="solid-card rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(new Date(day.date))}</p>
                <p>{Math.round(day.temperatureMin)}° / {Math.round(day.temperatureMax)}°</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-500/20">
                <div className="h-full rounded-full accent-gradient" style={{ width: `${day.rainProbability}%` }} />
              </div>
              <p className="text-muted mt-2 text-sm">{day.rainProbability}% rain, UV {day.uvIndex.toFixed(1)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function InsightsAlerts({ insights, alerts }: { insights: string[]; alerts: ReturnType<typeof generateAlerts> }) {
  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="glass-card rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold">AI Insights Engine</h2>
        <p className="text-muted mt-2">Generated locally from weather data. No external AI APIs are used.</p>
        <div className="mt-4 grid gap-3">
          {insights.map((insight) => (
            <article key={insight} className="solid-card rounded-2xl p-4">{insight}</article>
          ))}
        </div>
      </div>
      <div className="glass-card rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold">Weather Alerts</h2>
        <div className="mt-4 grid gap-3">
          {alerts.length ? alerts.map((alert) => (
            <article key={`${alert.type}-${alert.message}`} className="solid-card rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-amber-300" aria-hidden="true" />
                <p className="font-semibold">{alert.type} {alert.severity}</p>
              </div>
              <p className="text-muted mt-2">{alert.message}</p>
            </article>
          )) : <article className="solid-card rounded-2xl p-4">No active alerts from local rules.</article>}
        </div>
      </div>
    </section>
  );
}

function AirAstronomy({ weather }: { weather: WeatherBundle }) {
  const sunrise = new Date(weather.current.sunrise);
  const sunset = new Date(weather.current.sunset);
  const dayLength = Math.max(0, sunset.getTime() - sunrise.getTime()) / 36e5;
  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="glass-card rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold">Air Quality</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <StatCard icon={Gauge} label="AQI" value={String(weather.airQuality.aqi)} detail="US AQI estimate." />
          <StatCard icon={Droplets} label="PM2.5" value={`${weather.airQuality.pm25.toFixed(1)}`} detail="Fine particulate matter." />
          <StatCard icon={Cloud} label="PM10" value={`${weather.airQuality.pm10.toFixed(1)}`} detail="Coarse particulate matter." />
          <StatCard icon={Wind} label="NO2 / CO" value={`${weather.airQuality.nitrogenDioxide.toFixed(1)} / ${weather.airQuality.carbonMonoxide.toFixed(0)}`} detail="Gas concentration indicators." />
        </div>
      </div>
      <div className="glass-card rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold">Astronomy Center</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <StatCard icon={Sunrise} label="Sunrise" value={formatTime(weather.current.sunrise)} detail="Local first light estimate." />
          <StatCard icon={Sunset} label="Sunset" value={formatTime(weather.current.sunset)} detail="Local evening transition." />
          <StatCard icon={Moon} label="Moon Phase" value={moonPhaseName()} detail="Approximate lunar phase calculation." />
          <StatCard icon={Sun} label="Day Length" value={`${dayLength.toFixed(1)} h`} detail="Computed from sunrise and sunset." />
        </div>
      </div>
    </section>
  );
}

function PlanningTools({ weather }: { weather: WeatherBundle }) {
  return (
    <section className="glass-card mt-6 rounded-[2rem] p-6">
      <h2 className="text-2xl font-semibold">Comparison, travel, and photography planner</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <article className="solid-card rounded-2xl p-5">
          <h3 className="font-semibold">Weather Comparison</h3>
          <p className="text-muted mt-2">Compare saved favorites side-by-side by selecting cities from search results.</p>
        </article>
        <article className="solid-card rounded-2xl p-5">
          <h3 className="font-semibold">Travel Weather Planner</h3>
          <p className="text-muted mt-2">Use the 14-day destination forecast to evaluate expected trip conditions.</p>
        </article>
        <article className="solid-card rounded-2xl p-5">
          <h3 className="font-semibold">Weather Photography Mode</h3>
          <p className="text-muted mt-2">
            Golden hour near {formatTime(weather.current.sunrise)} and {formatTime(weather.current.sunset)}. Cloud cover is {weather.current.cloudCover}%.
          </p>
        </article>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-10 flex flex-col justify-between gap-4 border-t border-white/10 py-8 md:flex-row">
      <p className="text-muted">Weather Checking uses Open-Meteo APIs and stores preferences locally.</p>
      <nav className="flex flex-wrap gap-4" aria-label="Footer navigation">
        <Link href="/privacy-policy">Privacy Policy</Link>
        <Link href="/terms-and-conditions">Terms and Conditions</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
    </footer>
  );
}

function formatTime(value: string) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function moonPhaseName() {
  const lp = 2551443;
  const now = new Date();
  const newMoon = new Date("2001-01-01T00:00:00Z");
  const phase = ((now.getTime() - newMoon.getTime()) / 1000) % lp;
  const index = Math.floor((phase / lp) * 8);
  return ["New", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full", "Waning Gibbous", "Last Quarter", "Waning Crescent"][index];
}
