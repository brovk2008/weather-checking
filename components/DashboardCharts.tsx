"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { HourlyWeather } from "@/types/weather";

function labelTime(value: string) {
  return new Intl.DateTimeFormat("en", { hour: "numeric" }).format(new Date(value));
}

export function DashboardCharts({ hourly }: { hourly: HourlyWeather[] }) {
  const data = hourly.map((hour) => ({
    time: labelTime(hour.time),
    temperature: hour.temperature,
    rain: hour.rainProbability,
    humidity: hour.humidity,
    wind: hour.windSpeed
  }));

  return (
    <section className="grid gap-4 xl:grid-cols-2" aria-label="Weather dashboard analytics">
      <ChartCard title="Temperature Trends">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.2)" />
            <XAxis dataKey="time" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip />
            <Area type="monotone" dataKey="temperature" stroke="#67e8f9" fill="#67e8f955" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Rain Trends">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.2)" />
            <XAxis dataKey="time" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip />
            <Bar dataKey="rain" fill="#a78bfa" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Humidity Trends">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.2)" />
            <XAxis dataKey="time" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip />
            <Line type="monotone" dataKey="humidity" stroke="#34d399" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Wind Analytics">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.2)" />
            <XAxis dataKey="time" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip />
            <Area type="monotone" dataKey="wind" stroke="#fbbf24" fill="#fbbf2450" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </section>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="glass-card rounded-[2rem] p-5">
      <h3 className="mb-4 text-xl font-semibold">{title}</h3>
      {children}
    </article>
  );
}
