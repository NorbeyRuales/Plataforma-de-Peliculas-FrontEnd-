// src/theme/AppThemeProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from './GlobalStyle';
import { darkTheme, lightTheme } from './themes';

type ThemeName = 'light' | 'dark';
type Ctx = { themeName: ThemeName; toggle: () => void; set: (t: ThemeName) => void; };

const ThemeCtx = createContext<Ctx>({ themeName: 'light', toggle: () => {}, set: () => {} });
export const useAppTheme = () => useContext(ThemeCtx);

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mql = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : ({ matches: false } as MediaQueryList);

  const getInitial = (): ThemeName => {
    try {
      const saved = localStorage.getItem('theme') as ThemeName | null;
      if (saved) return saved;
    } catch {}
    return mql.matches ? 'dark' : 'light';
  };

  const [themeName, setThemeName] = useState<ThemeName>(getInitial);

  useEffect(() => {
    try { localStorage.setItem('theme', themeName); } catch {}
    document.documentElement.dataset.theme = themeName;
  }, [themeName]);

  useEffect(() => {
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) setThemeName(e.matches ? 'dark' : 'light');
    };
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);

  const theme = useMemo(() => (themeName === 'dark' ? darkTheme : lightTheme), [themeName]);
  const value = useMemo(() => ({
    themeName,
    toggle: () => setThemeName(t => (t === 'dark' ? 'light' : 'dark')),
    set: setThemeName,
  }), [themeName]);

  return (
    <ThemeCtx.Provider value={value}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </ThemeCtx.Provider>
  );
};
