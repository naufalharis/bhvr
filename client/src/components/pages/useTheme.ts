// src/pages/useTheme.ts
import { useState, useEffect } from "react";

export type Theme = "light" | "dark" | "system";

export default function useTheme(defaultTheme: Theme = "system") {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    // Apply theme when component mounts or theme changes
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove("light", "dark");
    
    // Determine which theme to apply
    let effectiveTheme: "light" | "dark" = theme === "system" 
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;

    // Apply the effective theme
    root.classList.add(effectiveTheme);
    root.setAttribute("data-theme", effectiveTheme);
    
    // Also set data-theme attribute for system preference
    if (theme === "system") {
      root.setAttribute("data-theme", "system");
    }

  }, [theme]);

  return { theme, setTheme };
}