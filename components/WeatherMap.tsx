"use client";

import { useEffect, useRef } from "react";
import * as L from "leaflet";
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
  const elementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const markerIcon = L.divIcon({
      className: "weather-map-marker",
      html: "<span></span>",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const map = L.map(elementRef.current, {
      center: [location.latitude, location.longitude],
      zoom: 9,
      zoomControl: true,
      scrollWheelZoom: true
    });
    mapRef.current = map;

    L.tileLayer(tileStyles[mapStyle], {
      attribution: "OpenStreetMap, CARTO, Esri contributors"
    }).addTo(map);

    L.marker([location.latitude, location.longitude], { icon: markerIcon }).addTo(map).bindPopup(location.name);
    [
      { name: "Rain layer", lat: location.latitude + 0.12, lon: location.longitude - 0.08, color: "#38bdf8", radius: 16000 },
      { name: "Temperature layer", lat: location.latitude - 0.1, lon: location.longitude + 0.12, color: "#f97316", radius: 12000 },
      { name: "Wind layer", lat: location.latitude + 0.2, lon: location.longitude + 0.16, color: "#34d399", radius: 10000 },
      { name: "Cloud layer", lat: location.latitude - 0.18, lon: location.longitude - 0.12, color: "#a78bfa", radius: 13500 }
    ].forEach((layer) => {
      L.circle([layer.lat, layer.lon], {
        radius: layer.radius,
        color: layer.color,
        fillColor: layer.color,
        fillOpacity: 0.16,
        weight: 2
      }).addTo(map).bindPopup(layer.name);
      L.marker([layer.lat, layer.lon], { icon: markerIcon }).addTo(map).bindPopup(layer.name);
    });

    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, [location.latitude, location.longitude, location.name, mapStyle]);

  return (
    <section className="glass-card overflow-hidden rounded-[2rem] p-4" aria-label="Interactive weather map">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-muted text-sm">Weather map</p>
          <h2 className="text-2xl font-semibold">Radar, temperature, wind, and cloud layers</h2>
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
      <div ref={elementRef} className="leaflet-container" />
    </section>
  );
}
