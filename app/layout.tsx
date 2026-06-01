import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://brovk2008.github.io/weather-checking"),
  title: {
    default: "Weather Checking",
    template: "%s | Weather Checking"
  },
  description:
    "A premium weather platform with local forecasts, rain prediction, weather maps, air quality, astronomy, and activity scoring.",
  applicationName: "Weather Checking",
  manifest: "/manifest.webmanifest",
  keywords: ["weather", "forecast", "rain", "air quality", "weather maps"],
  openGraph: {
    title: "Weather Checking",
    description: "Premium weather intelligence powered by Open-Meteo.",
    url: "https://brovk2008.github.io/weather-checking",
    siteName: "Weather Checking",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Weather Checking",
    description: "Premium weather intelligence powered by Open-Meteo."
  }
};

export const viewport: Viewport = {
  themeColor: "#07111f",
  colorScheme: "dark light"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Weather Checking",
    applicationCategory: "WeatherApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
