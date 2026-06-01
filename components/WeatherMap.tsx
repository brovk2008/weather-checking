"use client";

import { MapContainer, Marker, Popup, TileLayer, Circle } from "react-leaflet";
import { Layers } from "lucide-react";
import type { Coordinates } from "@/types/weather";

const tileStyles = {
  Standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  Dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  Satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
};

export function WeatherMap({
  location,
  mapStyle,
  onStyleChange
}: {
  location: Coordinates;
  mapStyle: keyof typeof tileStyles;
  onStyleChange: (style: keyof typeof tileStyles) => void;
}) {
  const nearby = [
    { name: "North cell", latitude: location.latitude + 0.2, longitude: location.longitude + 0.16 },
    { name: "Wind front", latitude: location.latitude - 0.18, longitude: location.longitude - 0.12 }
  ];

  return (
    <section className="glass-card overflow-hidden rounded-[2rem] p-4" aria-label="Interactive weather map">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-muted text-sm">Weather map</p>
          <h2 className="text-2xl font-semibold">Radar, temperature, and wind layers</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(tileStyles) as Array<keyof typeof tileStyles>).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => onStyleChange(style)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 ${mapStyle === style ? "accent-gradient text-slate-950" : "solid-card"}`}
            >
              <Layers className="h-4 w-4" aria-hidden="true" />
              {style}
            </button>
          ))}
        </div>
      </div>
      <MapContainer center={[location.latitude, location.longitude]} zoom={9} scrollWheelZoom>
        <TileLayer attribution="OpenStreetMap contributors" url={tileStyles[mapStyle]} />
        <Marker position={[location.latitude, location.longitude]}>
          <Popup>{location.name}</Popup>
        </Marker>
        {nearby.map((place) => (
          <Marker key={place.name} position={[place.latitude, place.longitude]}>
            <Popup>{place.name}</Popup>
          </Marker>
        ))}
        <Circle center={[location.latitude, location.longitude]} radius={16000} pathOptions={{ color: "#38bdf8", fillOpacity: 0.12 }} />
        <Circle center={[location.latitude + 0.12, location.longitude - 0.08]} radius={9000} pathOptions={{ color: "#f472b6", fillOpacity: 0.14 }} />
        <Circle center={[location.latitude - 0.1, location.longitude + 0.12]} radius={12000} pathOptions={{ color: "#34d399", fillOpacity: 0.12 }} />
      </MapContainer>
    </section>
  );
}
