"use client";

import { motion } from "framer-motion";
import { Moon, Palette, Sparkles, Sun, Waves } from "lucide-react";
import type { ThemeName } from "@/types/weather";

const themes: Array<{ id: ThemeName; label: string; icon: React.ElementType }> = [
  { id: "dark", label: "Dark", icon: Moon },
  { id: "light", label: "Light", icon: Sun },
  { id: "midnight", label: "Midnight", icon: Waves },
  { id: "cyber", label: "Cyber", icon: Sparkles },
  { id: "glass", label: "Glass", icon: Palette }
];

export function ThemeSwitcher({
  theme,
  onThemeChange
}: {
  theme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}) {
  return (
    <div className="glass-card flex flex-wrap gap-2 rounded-full p-2" aria-label="Theme switcher">
      {themes.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={theme === item.id}
            onClick={() => onThemeChange(item.id)}
            className="relative flex items-center gap-2 rounded-full px-4 py-2 text-sm transition"
          >
            {theme === item.id ? (
              <motion.span
                layoutId="active-theme"
                className="accent-gradient absolute inset-0 rounded-full"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <Icon className="relative h-4 w-4" aria-hidden="true" />
            <span className="relative">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
