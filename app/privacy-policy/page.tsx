import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>Weather Checking is a client-focused weather application that uses Open-Meteo services to retrieve forecasts, geocoding data, and air quality information. We do not sell personal information.</p>
      <p>When you allow location access, your browser provides coordinates so the app can request local weather. Coordinates are sent to Open-Meteo only to fulfill the forecast request. Location permission is controlled by your browser settings.</p>
      <p>Search history, favorites, theme preference, contrast preference, and journal notes are stored locally in your browser using localStorage. This data is not transmitted to our servers by this application.</p>
      <p>The app may cache static files through a service worker to support installability and basic offline loading. You can clear browser site data at any time to remove cached files and local preferences.</p>
      <p>Open-Meteo API requests are governed by Open-Meteo policies. Hosting providers such as GitHub Pages, Netlify, or Vercel may process standard access logs when the site is deployed.</p>
      <p>For privacy requests, remove local data through your browser controls or contact the site operator listed in the deployment repository.</p>
    </LegalPage>
  );
}
