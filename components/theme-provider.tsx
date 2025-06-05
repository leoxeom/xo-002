"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const initialState: ThemeProviderState = {
  theme: "dark", // Golf Pass default
  setTheme: () => null,
  isDark: true,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "golfpass-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedTheme = window.localStorage.getItem(storageKey) as Theme | null;
        if (storedTheme && (storedTheme === "light" || storedTheme === "dark")) {
          return storedTheme;
        }
      } catch (e) {
        console.error("Error reading theme from localStorage", e);
      }
    }
    return defaultTheme;
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Apply glassmorphism-specific adjustments based on theme
    if (theme === "dark") {
        document.documentElement.style.setProperty(
          "--glass-bg",
          "rgba(20, 20, 20, 0.1)"
        );
        document.documentElement.style.setProperty(
          "--glass-border",
          "rgba(20, 20, 20, 0.18)"
        );
        document.documentElement.style.setProperty(
          "--glass-shadow",
          "0 8px 32px 0 rgba(0, 0, 0, 0.25)"
        );
      } else {
        document.documentElement.style.setProperty(
          "--glass-bg",
          "rgba(255, 255, 255, 0.1)"
        );
        document.documentElement.style.setProperty(
          "--glass-border",
          "rgba(255, 255, 255, 0.18)"
        );
        document.documentElement.style.setProperty(
          "--glass-shadow",
          "0 8px 32px 0 rgba(31, 38, 135, 0.15)"
        );
      }

    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (e) {
      console.error("Error saving theme to localStorage", e);
    }
  }, [theme, storageKey, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };
  
  const isDark = theme === "dark";

  if (!mounted) {
    // To prevent hydration mismatch, render children directly or a placeholder
    // until the client-side theme is determined.
    // For simplicity here, we render children, but this might cause a flash
    // if server-rendered HTML assumes a different theme.
    // A better approach for SSR might involve a CSS variable on `<html>` set by a script.
    return <>{children}</>;
  }

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
