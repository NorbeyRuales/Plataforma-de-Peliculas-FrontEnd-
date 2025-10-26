/**
 * @file AppThemeProvider.tsx
 * @summary Theme context provider that toggles between light and dark modes and syncs with `document.documentElement`.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeName = "light" | "dark";

type ThemeCtx = {
  themeName: ThemeName;
  setTheme: React.Dispatch<React.SetStateAction<ThemeName>>;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);
const THEME_LS_KEY = "app-theme";

/**
 * Theme provider component that persists the preference and updates the DOM root.
 * @component
 */
export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to light; respect localStorage if the user already selected a theme.
  const getInitial = (): ThemeName => {
    const stored = (typeof localStorage !== "undefined"
      ? (localStorage.getItem(THEME_LS_KEY) as ThemeName | null)
      : null);
    return stored ?? "light";
  };

  const [themeName, setTheme] = useState<ThemeName>(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", themeName);
    // Ensure native inputs/selects honor the chosen color scheme
    (root.style as any).colorScheme = themeName === "dark" ? "dark" : "light";
    try { localStorage.setItem(THEME_LS_KEY, themeName); } catch (_) { }
  }, [themeName]);

  const value = useMemo(
    () => ({
      themeName,
      setTheme,
      toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    }),
    [themeName]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Provides access to the theme context value.
 * @throws If used outside of `AppThemeProvider`.
 */
export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used inside <AppThemeProvider>");
  return ctx;
};

