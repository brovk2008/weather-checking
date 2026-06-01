"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bell,
  Bike,
  BookOpen,
  CalendarDays,
  Camera,
  Cloud,
  CloudRain,
  Compass,
  Droplets,
  Eye,
  Gauge,
  Heart,
  Home,
  Map,
  Moon,
  Navigation,
  Plane,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
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
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { WeatherJournal } from "@/components/WeatherJournal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { calculateActivityScores, generateAlerts, generateInsights, getRainRisk } from "@/lib/insights";
import { fetchWeather, searchLocations } from "@/lib/weatherApi";
import { getWeatherVisuals } from "@/lib/weatherImageService";
import type { Coordinates, GeocodingResult, ThemeName, WeatherBundle } from "@/types/weather";

const WeatherMap = dynamic(() => import("@/components/WeatherMap").then((module) => module.WeatherMap), {
  ssr: false,
  loading: () => <div className="premium-panel grid min-h-[420px] place-items-center rounded-[1.75rem]">Loading premium map</div>
});

const defaultLocation: Coordinates = {
  name: "San Francisco",
  country: "US",
  admin1: "California",
  latitude: 37.7749,
  longitude: -122.4194
};

const navItems = [
  ["Dashboard", Home],
  ["Map", Map],
  ["Forecast", CalendarDays],
  ["Rain Radar", CloudRain],
  ["Air Quality", Wind],
  ["Alerts", Bell],
  ["Astronomy", Moon],
  ["Insights", Sparkles],
  ["Activities", Activity],
  ["Compare", Compass],
  ["Planner", Plane],
  ["Journal", BookOpen],
  ["Settings", Settings]
] as const;

export default function HomePage() {
  const [theme, setTheme] = useLocalStorage<ThemeName>("weather-checking-theme", "midnight");
  const [recent, setRecent] = useLocalStorage<GeocodingResult[]>("weather-checking-recent", []);
  const [favorites, setFavorites] = useLocalStorage<GeocodingResult[]>("weather-checking-favorites", []);
  const [highContrast, setHighContrast] = useLocalStorage("weather-checking-contrast", false);
  const [location, setLocation] = useState<Coordinates>(defaultLocation);
  const [weather, setWeather] = useState<WeatherBundle | null>(null);
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [status, setStatus] = useState("Loading local weather intelligence");
  const [mapStyle, setMapStyle] = useState<"Standard" | "Dark" | "Satellite">("Dark");
  const visuals = useMemo(() => getWeatherVisuals(weather?.current), [weather]);
  const insights = useMemo(() => (weather ? generateInsights(weather) : []), [weather]);
  const alerts = useMemo(() => (weather ? generateAlerts(weather) : []), [weather]);
  const scores = useMemo(() => (weather ? calculateActivityScores(weather) : []), [weather]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    const asked = localStorage.getItem("weather-checking-location-asked");
    if (!asked && "geolocation" in navigator) {
      localStorage.setItem("weather-checking-location-asked", "true");
      if (window.confirm("Allow location access for local weather?")) {
        detectLocation();
        return;
      }
    }
    loadWeather(defaultLocation);
  }, []);

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
      setStatus("Geolocation is unavailable in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        loadWeather({
          name: "Current Location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }),
      () => setStatus("Location permission denied. Search for a city instead."),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  return (
    <main className={highContrast ? "weather-product high-contrast" : "weather-product"}>
      <div className="cinematic-bg" style={{ backgroundImage: `url("${visuals.backgroundImage}")` }} />
      <div className="weather-noise" />
      <WeatherParticles condition={visuals.condition} />
      <Sidebar theme={theme} setTheme={setTheme} />
      <section className="dashboard-stage">
        <TopBar
          onSearch={handleSearch}
          onSelect={selectLocation}
          onLocate={detectLocation}
          results={results}
          recent={recent}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          status={status}
        />
        <ErrorBoundary>
          <Hero weather={weather} location={location} visuals={visuals} highContrast={highContrast} setHighContrast={setHighContrast} />
          {weather ? (
            <>
              <QuickStats weather={weather} />
              <section className="dashboard-grid">
                <ForecastPanel weather={weather} />
                <SevenDayPanel weather={weather} />
                <MapPanel location={weather.location} mapStyle={mapStyle} setMapStyle={setMapStyle} />
                <InsightsPanel insights={insights} alerts={alerts} />
                <ActivityPanel scores={scores} />
              </section>
              <DashboardCharts hourly={weather.hourly} />
              <RainCenter weather={weather} />
              <PhotographyMode weather={weather} image={visuals.sideImage} />
              <GaugeGrid scores={scores} />
              <PlannerJournal weather={weather} />
            </>
          ) : null}
        </ErrorBoundary>
        <Footer attribution={visuals.attribution} />
      </section>
    </main>
  );
}

function Sidebar({ theme, setTheme }: { theme: ThemeName; setTheme: (theme: ThemeName) => void }) {
  return (
    <aside className="premium-sidebar" aria-label="Primary navigation">
      <Link href="/" className="brand-lockup">
        <span className="brand-icon"><Cloud aria-hidden="true" /></span>
        <span>
          <span className="block font-bold">Weather Checking</span>
          <span className="text-muted text-xs">Advanced Weather Intelligence</span>
        </span>
      </Link>
      <nav className="mt-7 grid gap-1">
        {navItems.map(([label, Icon], index) => (
          <a key={label} href={`#${label.toLowerCase().replace(/\s+/g, "-")}`} className={index === 0 ? "nav-link active" : "nav-link"}>
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{label}</span>
            {label === "Alerts" ? <span className="nav-badge">3</span> : null}
          </a>
        ))}
      </nav>
      <div className="mt-auto grid gap-4">
        <ThemeSwitcher theme={theme} onThemeChange={setTheme} />
        <div className="upgrade-card">
          <Sparkles className="h-6 w-6 text-cyan-200" aria-hidden="true" />
          <h2 className="mt-3 text-xl font-semibold">Premium Experience</h2>
          <p className="text-muted mt-2 text-sm">Advanced maps, AI-style insights, and visual planning tools.</p>
          <button className="accent-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold text-slate-950" type="button">
            <Star className="h-4 w-4" aria-hidden="true" />
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}

function TopBar(props: {
  onSearch: (query: string) => void;
  onSelect: (location: GeocodingResult) => void;
  onLocate: () => void;
  results: GeocodingResult[];
  recent: GeocodingResult[];
  favorites: GeocodingResult[];
  onToggleFavorite: (location: GeocodingResult) => void;
  status: string;
}) {
  return (
    <header className="top-command">
      <div className="top-search">
        <Search className="text-muted h-5 w-5" aria-hidden="true" />
        <SearchBox {...props} />
      </div>
      <div className="top-actions">
        <button type="button" onClick={props.onLocate} className="round-action" aria-label="Detect location"><Navigation /></button>
        <button type="button" className="round-action" aria-label="Favorites"><Star /></button>
        <button type="button" className="round-action with-dot" aria-label="Notifications"><Bell /></button>
        <div className="avatar" aria-label="User profile" />
      </div>
    </header>
  );
}

function Hero({
  weather,
  location,
  visuals,
  highContrast,
  setHighContrast
}: {
  weather: WeatherBundle | null;
  location: Coordinates;
  visuals: ReturnType<typeof getWeatherVisuals>;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
}) {
  const current = weather?.current;
  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="hero-stage" id="dashboard">
      <video className="hero-video" src={visuals.video} autoPlay muted loop playsInline poster={visuals.sideImage} />
      <div className="hero-overlay" />
      <div className="hero-main">
        <div className="location-row">
          <h1>{location.name}, {location.admin1 ? `${location.admin1}, ` : ""}{location.country ?? ""}</h1>
          <Navigation className="h-4 w-4" aria-hidden="true" />
        </div>
        <p className="text-sm text-slate-200">{formatDate(new Date())} <span className="mx-3"> </span> {formatClock(new Date())} <span className="live-pill">Live</span></p>
        <div className="current-row">
          <p className="hero-temp">{current ? Math.round(current.temperature) : "--"}<span>°C</span></p>
          <AnimatedWeatherIcon condition={visuals.condition} />
          <div>
            <h2 className="text-2xl font-semibold">{visuals.condition}</h2>
            <p className="mt-2 max-w-xs text-slate-200">
              {current ? recommendation(current, visuals.condition) : "Loading local conditions and insights."}
            </p>
          </div>
        </div>
        <div className="hero-metrics">
          <HeroMetric icon={Droplets} label="Humidity" value={`${current?.humidity ?? "--"}%`} />
          <HeroMetric icon={Wind} label="Wind" value={`${Math.round(current?.windSpeed ?? 0)} km/h`} />
          <HeroMetric icon={Eye} label="Visibility" value={`${current?.visibility.toFixed(0) ?? "--"} km`} />
          <HeroMetric icon={Gauge} label="Pressure" value={`${Math.round(current?.pressure ?? 0)} hPa`} />
          <HeroMetric icon={Sun} label="UV Index" value={`${current?.uvIndex.toFixed(1) ?? "--"}`} />
        </div>
      </div>
      <aside className="sunset-card" style={{ backgroundImage: `url("${visuals.sideImage}")` }}>
        <div>
          <p className="text-sm">Sunset</p>
          <p className="mt-1 text-2xl font-semibold">{current ? formatClock(new Date(current.sunset)) : "--"}</p>
          <p className="mt-2 text-sm text-amber-100">Golden hour</p>
          <p className="text-sm text-slate-200">{current ? `${formatClock(new Date(current.sunset))} window` : "Calculating"}</p>
        </div>
      </aside>
      <button type="button" onClick={() => setHighContrast(!highContrast)} className="contrast-chip">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        High contrast
      </button>
    </motion.section>
  );
}

function QuickStats({ weather }: { weather: WeatherBundle }) {
  const stats = [
    ["Air Quality", String(weather.airQuality.aqi), "Good", Wind],
    ["Rain Chance", `${weather.current.rainChance}%`, getRainRisk(weather.current.rainChance, weather.current.rainAmount), Umbrella],
    ["Feels Like", `${Math.round(weather.current.feelsLike)}°C`, "Comfort index", Thermometer],
    ["Dew Point", `${Math.round(weather.current.dewPoint)}°C`, "Moisture level", Droplets]
  ] as const;
  return (
    <section className="quick-stat-row">
      {stats.map(([label, value, detail, Icon]) => (
        <article key={label} className="premium-panel metric-card">
          <Icon className="h-5 w-5 text-cyan-200" aria-hidden="true" />
          <p className="text-muted mt-3 text-sm">{label}</p>
          <p className="mt-1 text-3xl font-semibold">{value}</p>
          <p className="text-sm text-emerald-300">{detail}</p>
        </article>
      ))}
    </section>
  );
}

function ForecastPanel({ weather }: { weather: WeatherBundle }) {
  return (
    <section className="premium-panel forecast-panel" id="forecast">
      <h2>24-Hour Forecast</h2>
      <div className="hour-strip">
        {weather.hourly.slice(0, 12).map((hour, index) => (
          <article key={hour.time} className="hour-card">
            <p className="text-xs">{index === 0 ? "Now" : formatClock(new Date(hour.time))}</p>
            <Cloud className="mx-auto my-3 h-7 w-7 text-slate-200" aria-hidden="true" />
            <p className="text-xl font-bold">{Math.round(hour.temperature)}°</p>
            <div className="sparkline" style={{ transform: `translateY(${Math.max(-8, 8 - hour.temperature / 2)}px)` }} />
            <p className="mt-3 text-xs text-sky-300">{hour.rainProbability}%</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SevenDayPanel({ weather }: { weather: WeatherBundle }) {
  return (
    <section className="premium-panel seven-day">
      <div className="flex items-center justify-between">
        <h2>7-Day Forecast</h2>
        <button type="button" className="text-sm text-sky-300">View all</button>
      </div>
      <div className="mt-4 grid gap-3">
        {weather.daily.slice(0, 7).map((day) => (
          <div key={day.date} className="day-row">
            <span>{new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric" }).format(new Date(day.date))}</span>
            <Sun className="h-4 w-4 text-amber-300" aria-hidden="true" />
            <span>{Math.round(day.temperatureMax)}° / {Math.round(day.temperatureMin)}°</span>
            <span className="text-sky-300">{day.rainProbability}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function MapPanel({ location, mapStyle, setMapStyle }: { location: Coordinates; mapStyle: "Standard" | "Dark" | "Satellite"; setMapStyle: (style: "Standard" | "Dark" | "Satellite") => void }) {
  return (
    <section className="map-shell" id="map">
      <WeatherMap location={location} mapStyle={mapStyle} onStyleChange={setMapStyle} />
    </section>
  );
}

function InsightsPanel({ insights, alerts }: { insights: string[]; alerts: ReturnType<typeof generateAlerts> }) {
  const cards = [
    ...insights.slice(0, 4).map((text, index) => ({ title: text.split(".")[0], detail: text, icon: [Umbrella, Heart, Sun, Navigation][index] ?? Sparkles, tone: "text-cyan-200" })),
    ...alerts.slice(0, 2).map((alert) => ({ title: alert.type, detail: alert.message, icon: AlertTriangle, tone: "text-amber-300" }))
  ];
  return (
    <section className="premium-panel insights-panel" id="insights">
      <h2>Weather Insights</h2>
      <div className="mt-4 grid gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={`${card.title}-${card.detail}`} className="insight-row">
              <span className="insight-icon"><Icon className={`h-5 w-5 ${card.tone}`} aria-hidden="true" /></span>
              <span>
                <span className="block font-semibold">{card.title}</span>
                <span className="text-muted text-sm">{card.detail}</span>
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ActivityPanel({ scores }: { scores: ReturnType<typeof calculateActivityScores> }) {
  const icons = [Activity, Bike, Umbrella, Camera, Moon, Navigation];
  return (
    <section className="premium-panel activity-panel" id="activities">
      <div className="flex items-center justify-between">
        <h2>Activity Scores</h2>
        <button type="button" className="text-sm text-sky-300">See all</button>
      </div>
      <div className="activity-grid">
        {scores.slice(0, 6).map((item, index) => {
          const Icon = icons[index] ?? Activity;
          return (
            <article key={item.name} className="activity-score">
              <div className="small-gauge" style={{ background: `conic-gradient(var(--accent) ${item.score * 3.6}deg, rgba(255,255,255,.12) 0deg)` }}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-xs">{item.name}</p>
              <p className="text-xl font-bold">{Math.round(item.score / 10)}/10</p>
              <p className="text-xs text-emerald-300">{item.score > 80 ? "Excellent" : item.score > 60 ? "Good" : "Caution"}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function RainCenter({ weather }: { weather: WeatherBundle }) {
  const maxRain = Math.max(...weather.hourly.map((hour) => hour.precipitation), 0);
  return (
    <section className="premium-panel mt-6" id="rain-radar">
      <h2>Rain Prediction Center</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <MetricTile label="Risk" value={getRainRisk(weather.current.rainChance, weather.current.rainAmount)} icon={CloudRain} />
        <MetricTile label="Probability" value={`${weather.current.rainChance}%`} icon={Umbrella} />
        <MetricTile label="Expected Rainfall" value={`${maxRain.toFixed(1)} mm`} icon={Droplets} />
        <MetricTile label="Confidence" value={`${Math.min(98, Math.round(55 + weather.current.rainChance * 0.35 + maxRain * 2))}%`} icon={ShieldCheck} />
      </div>
    </section>
  );
}

function PhotographyMode({ weather, image }: { weather: WeatherBundle; image: string }) {
  const score = Math.max(20, Math.min(98, Math.round(100 - weather.current.cloudCover * 0.35 - weather.current.rainChance * 0.4 + weather.current.uvIndex * 2)));
  return (
    <section className="photo-mode" id="astronomy" style={{ backgroundImage: `linear-gradient(90deg, rgba(4,10,25,.84), rgba(4,10,25,.35)), url("${image}")` }}>
      <div>
        <p className="text-muted text-sm">Weather Photography Mode</p>
        <h2 className="mt-2 text-3xl font-semibold">Golden hour and landscape readiness</h2>
        <p className="mt-3 max-w-2xl text-slate-200">Uses sunrise, sunset, cloud cover, rain chance, and UV data to estimate shooting quality.</p>
      </div>
      <div className="photo-grid">
        <MetricTile label="Golden Hour" value={formatClock(new Date(weather.current.sunset))} icon={Sunset} />
        <MetricTile label="Blue Hour" value={formatClock(new Date(new Date(weather.current.sunset).getTime() + 28 * 60000))} icon={Moon} />
        <MetricTile label="Cloud Rating" value={`${100 - weather.current.cloudCover}%`} icon={Cloud} />
        <MetricTile label="Photo Rating" value={`${score}%`} icon={Camera} />
      </div>
    </section>
  );
}

function PlannerJournal({ weather }: { weather: WeatherBundle }) {
  return (
    <section className="planner-row" id="planner">
      <article className="premium-panel cta-card">
        <Plane className="h-10 w-10 text-sky-300" aria-hidden="true" />
        <h2>Travel Planner</h2>
        <p className="text-muted">Plan your trip with confidence using the 14-day destination forecast for {weather.location.name}.</p>
      </article>
      <article className="premium-panel cta-card" id="compare">
        <Compass className="h-10 w-10 text-violet-300" aria-hidden="true" />
        <h2>Compare Cities</h2>
        <p className="text-muted">Use favorites and recent searches to quickly compare weather windows across locations.</p>
      </article>
      <div id="journal">
        <WeatherJournal />
      </div>
    </section>
  );
}

function WeatherParticles({ condition }: { condition: string }) {
  const count = condition === "Rain" ? 34 : condition === "Snow" ? 28 : 18;
  return (
    <div className={`particle-layer ${condition.toLowerCase().replace(/\s+/g, "-")}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => <span key={index} style={{ "--i": index } as React.CSSProperties} />)}
    </div>
  );
}

function AnimatedWeatherIcon({ condition }: { condition: string }) {
  const Icon = condition.includes("Rain") ? CloudRain : condition.includes("Night") ? Moon : condition.includes("Clear") ? Sun : Cloud;
  return (
    <div className="weather-orb">
      <Icon className="h-20 w-20" aria-hidden="true" />
    </div>
  );
}

function HeroMetric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="hero-metric">
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span><span className="text-muted block text-xs">{label}</span>{value}</span>
    </div>
  );
}

function MetricTile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <article className="metric-tile">
      <Icon className="h-5 w-5 text-cyan-200" aria-hidden="true" />
      <p className="text-muted mt-3 text-sm">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </article>
  );
}

function Footer({ attribution }: { attribution: string }) {
  return (
    <footer className="mt-8 flex flex-col justify-between gap-4 py-8 text-sm text-slate-300 md:flex-row">
      <p>{attribution}</p>
      <nav className="flex flex-wrap gap-4" aria-label="Footer navigation">
        <Link href="/privacy-policy">Privacy Policy</Link>
        <Link href="/terms-and-conditions">Terms and Conditions</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
    </footer>
  );
}

function recommendation(current: NonNullable<WeatherBundle["current"]>, condition: string) {
  if (current.rainChance > 60) return "Rain risk is elevated. Carry waterproof layers and avoid exposed evening plans.";
  if (current.windSpeed > 35) return "Winds are strong enough to affect cycling, drones, and outdoor setup.";
  if (current.uvIndex > 7) return "UV levels are high. Schedule outdoor work before midday or after golden hour.";
  return `${condition} conditions support outdoor planning with comfortable visibility and manageable wind.`;
}

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(date);
}
