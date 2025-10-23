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
  const getInitial = (): ThemeName => {
    const stored = localStorage.getItem(THEME_LS_KEY) as ThemeName | null;
    if (stored === "light" || stored === "dark") return stored;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  };

  const [themeName, setTheme] = useState<ThemeName>(getInitial);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeName);
    localStorage.setItem(THEME_LS_KEY, themeName);
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
