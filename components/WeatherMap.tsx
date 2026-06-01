"use client";

import { useEffect, useRef } from "react";
import * as L from "leaflet";
import { Layers } from "lucide-react";
import type { Coordinates } from "@/types/weather";

const tileStyles = {
  Standard: "standard",
  Dark: "dark",
  Satellite: "satellite"
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

    createWeatherTileLayer(mapStyle).addTo(map);

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

function createWeatherTileLayer(style: keyof typeof tileStyles) {
  const WeatherGridLayer = L.GridLayer.extend({
    createTile(coords: L.Coords) {
      const tile = document.createElement("canvas");
      tile.width = 256;
      tile.height = 256;
      const context = tile.getContext("2d");
      if (!context) return tile;

      const hueBase = style === "Satellite" ? 128 : style === "Dark" ? 218 : 194;
      const gradient = context.createLinearGradient(0, 0, 256, 256);
      gradient.addColorStop(0, style === "Dark" ? "#081528" : style === "Satellite" ? "#183726" : "#12324a");
      gradient.addColorStop(0.55, style === "Dark" ? "#0e2440" : style === "Satellite" ? "#49612d" : "#1c6b83");
      gradient.addColorStop(1, style === "Dark" ? "#150d2f" : style === "Satellite" ? "#172a3d" : "#24356f");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);

      for (let row = -32; row < 300; row += 24) {
        context.beginPath();
        for (let x = -20; x < 280; x += 20) {
          const y = row + Math.sin((x + coords.x * 13 + coords.y * 7) / 36) * 10;
          if (x === -20) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = `hsla(${hueBase + row / 8}, 85%, 68%, .16)`;
        context.lineWidth = 1.3;
        context.stroke();
      }

      for (let index = 0; index < 42; index += 1) {
        const x = (index * 47 + coords.x * 31) % 256;
        const y = (index * 29 + coords.y * 23) % 256;
        const radius = 24 + ((index + coords.z) % 7) * 8;
        const cell = context.createRadialGradient(x, y, 0, x, y, radius);
        cell.addColorStop(0, `hsla(${hueBase + index * 7}, 90%, 62%, .18)`);
        cell.addColorStop(1, "transparent");
        context.fillStyle = cell;
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }

      context.strokeStyle = "rgba(255,255,255,.12)";
      context.lineWidth = 1;
      context.strokeRect(0, 0, 256, 256);
      return tile;
    }
  }) as unknown as new (options: L.GridLayerOptions) => L.GridLayer;
  return new WeatherGridLayer({ tileSize: 256, opacity: 0.96 });
}
