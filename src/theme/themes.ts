// src/theme/themes.ts
import { DefaultTheme } from 'styled-components';

export const lightTheme: DefaultTheme = {
  name: 'light',
  colors: {
    bg: '#F9F2E2',
    surface: '#ffffff',
    text: '#1D2129',
    mutedText: '#6B7280',
    primary: '#0ea5e9',
    accent: '#2563EB',
    border: '#E5E7EB',
    shadow: 'rgba(0,0,0,.08)',
  },
};

export const darkTheme: DefaultTheme = {
  name: 'dark',
  colors: {
    bg: '#0B0F19',
    surface: '#111827',
    text: '#F8FAFC',
    mutedText: '#94A3B8',
    primary: '#FF3040',
    accent: '#60A5FA',
    border: '#243244',
    shadow: 'rgba(0,0,0,.5)',
    primaryHover: '#FF4753',
    primaryActive: '#E21E30',
    // (los demás opcionales si los quieres)
  },
};
