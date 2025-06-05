import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps as NextThemesProviderProps } from "next-themes/dist/types";

// Define types for our theme context
type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme | undefined;
  setTheme: (theme: Theme) => void;
  resolvedTheme: string | undefined;
  isDark: boolean;
  isLoading: boolean;
  error: Error | null;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: undefined,
  setTheme: () => null,
  resolvedTheme: undefined,
  isDark: true, // Default to dark as per Golf Pass design system
  isLoading: true,
  error: null,
});

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export function ThemeProvider({
  children,
  ...props
}: NextThemesProviderProps) {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  // Fix for hydration mismatch
  useEffect(() => {
    setMounted(true);
    setIsLoading(false);
  }, []);

  // Custom setTheme function with error handling
  const handleSetTheme = (newTheme: Theme) => {
    try {
      // Apply glassmorphism-specific adjustments based on theme
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
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
        document.documentElement.classList.remove("dark");
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
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to set theme"));
      console.error("Error setting theme:", err);
    }
  };

  // If not mounted yet, return null to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark" // Golf Pass uses dark mode by default
      enableSystem={true}
      disableTransitionOnChange={false}
      {...props}
    >
      <ThemeProviderInternal 
        handleSetTheme={handleSetTheme} 
        error={error}
        isLoading={isLoading}
      >
        {children}
      </ThemeProviderInternal>
    </NextThemesProvider>
  );
}

// Internal component to consume next-themes and provide our context
function ThemeProviderInternal({
  children,
  handleSetTheme,
  error,
  isLoading,
}: {
  children: React.ReactNode;
  handleSetTheme: (theme: Theme) => void;
  error: Error | null;
  isLoading: boolean;
}) {
  const { theme, setTheme, resolvedTheme } = useContext(NextThemesProvider.Context);
  const isDark = resolvedTheme === "dark";

  // Custom setTheme with error handling
  const setThemeWithErrorHandling = (newTheme: Theme) => {
    try {
      setTheme(newTheme);
      handleSetTheme(newTheme);
    } catch (err) {
      console.error("Failed to set theme:", err);
    }
  };

  // Create the context value
  const contextValue: ThemeContextType = {
    theme: theme as Theme | undefined,
    setTheme: setThemeWithErrorHandling,
    resolvedTheme,
    isDark,
    isLoading,
    error,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
