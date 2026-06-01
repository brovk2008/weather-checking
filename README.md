# Weather Checking

Weather Checking is a production-ready weather platform built with Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Leaflet, Recharts, and Open-Meteo APIs.

## Features

- Geolocation-first local weather with city search fallback
- Open-Meteo current, hourly, daily, air quality, and geocoding data
- Rain prediction center, alerts, AI-style local insights, and advanced analytics
- Interactive Leaflet weather map with standard, dark, and satellite styles
- Five animated themes with `localStorage` persistence
- PWA manifest, service worker, offline fallback, robots, sitemap, and structured data
- Legal pages for privacy policy and terms

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npm run build
npm start
```

## Deploy

The app can deploy to Vercel, Netlify, or GitHub Pages. No API keys are required because Open-Meteo APIs are public.

## Media Attribution

- Animated banner video: `Clouds at sunset (time lapse).webm`, Wikimedia Commons, CC BY 3.0.
- Dynamic scenic images are requested from Unsplash Source based on weather condition.
