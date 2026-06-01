import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Terms and Conditions" };

export default function Terms() {
  return (
    <LegalPage title="Terms and Conditions">
      <p>Weather Checking provides weather information, forecasts, analytics, and planning scores for general informational use. It is not a substitute for official government weather warnings, emergency instructions, aviation guidance, marine guidance, or professional safety advice.</p>
      <p>Forecasts are generated from third-party data sources and local calculations. Weather conditions can change quickly, and accuracy is not guaranteed. You are responsible for decisions made using the application.</p>
      <p>You agree not to misuse the service, interfere with its operation, attempt unauthorized access, or use automated traffic in a way that violates Open-Meteo or hosting provider policies.</p>
      <p>The application is provided as is without warranties of merchantability, fitness for a particular purpose, or uninterrupted availability. To the maximum extent allowed by law, the operators are not liable for indirect, incidental, consequential, or safety-related losses.</p>
      <p>These terms may be updated as the application evolves. Continued use after changes means you accept the updated terms.</p>
    </LegalPage>
  );
}
