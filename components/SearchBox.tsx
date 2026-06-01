"use client";

import { FormEvent, useMemo, useState } from "react";
import { Heart, LocateFixed, Search } from "lucide-react";
import { createRateLimiter, sanitizeSearchInput } from "@/lib/sanitize";
import type { GeocodingResult } from "@/types/weather";

const isAllowed = createRateLimiter(12, 60_000);

export function SearchBox({
  onSearch,
  onSelect,
  onLocate,
  results,
  recent,
  favorites,
  onToggleFavorite
}: {
  onSearch: (query: string) => void;
  onSelect: (location: GeocodingResult) => void;
  onLocate: () => void;
  results: GeocodingResult[];
  recent: GeocodingResult[];
  favorites: GeocodingResult[];
  onToggleFavorite: (location: GeocodingResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const favoriteIds = useMemo(() => new Set(favorites.map((place) => place.id)), [favorites]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const clean = sanitizeSearchInput(query);
    if (!clean) return;
    if (!isAllowed()) {
      setError("Search rate limit reached. Wait a minute and try again.");
      return;
    }
    setError("");
    onSearch(clean);
  }

  return (
    <section className="glass-card rounded-[2rem] p-5" aria-label="City search">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="city-search">
          Search by city, state, or country
        </label>
        <div className="relative flex-1">
          <Search className="text-muted absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" aria-hidden="true" />
          <input
            id="city-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search city, state, or country"
            className="solid-card w-full rounded-2xl px-12 py-4"
          />
        </div>
        <button type="submit" className="accent-gradient flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-semibold text-slate-950">
          <Search className="h-5 w-5" aria-hidden="true" />
          Search
        </button>
        <button type="button" onClick={onLocate} className="solid-card flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-semibold">
          <LocateFixed className="h-5 w-5" aria-hidden="true" />
          Detect my location
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      {results.length ? (
        <div className="mt-4 grid gap-2">
          {results.map((place) => (
            <div key={place.id} className="solid-card flex items-center justify-between gap-3 rounded-2xl p-3">
              <button type="button" onClick={() => onSelect(place)} className="flex-1 text-left">
                <span className="font-semibold">{place.name}</span>
                <span className="text-muted block text-sm">{[place.admin1, place.country].filter(Boolean).join(", ")}</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleFavorite(place)}
                className="rounded-xl p-2"
                aria-label={`Toggle favorite for ${place.name}`}
              >
                <Heart className={favoriteIds.has(place.id) ? "fill-current" : ""} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <SavedPlaces title="Recent searches" places={recent} onSelect={onSelect} />
        <SavedPlaces title="Favorites" places={favorites} onSelect={onSelect} />
      </div>
    </section>
  );
}

function SavedPlaces({
  title,
  places,
  onSelect
}: {
  title: string;
  places: GeocodingResult[];
  onSelect: (location: GeocodingResult) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {places.length ? (
          places.slice(0, 6).map((place) => (
            <button key={`${title}-${place.id}`} type="button" onClick={() => onSelect(place)} className="solid-card rounded-full px-3 py-2 text-sm">
              {place.name}
            </button>
          ))
        ) : (
          <span className="text-muted text-sm">No saved locations yet.</span>
        )}
      </div>
    </div>
  );
}
