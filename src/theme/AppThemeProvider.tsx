import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeName = "light" | "dark";

type ThemeCtx = {
  themeName: ThemeName;
  setTheme: React.Dispatch<React.SetStateAction<ThemeName>>;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);
const THEME_LS_KEY = "app-theme";

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Por defecto: LIGHT. Si el usuario ya eligió, respetar localStorage.
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
    // Help native inputs/selects use the correct schema
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

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used inside <AppThemeProvider>");
  return ctx;
};
