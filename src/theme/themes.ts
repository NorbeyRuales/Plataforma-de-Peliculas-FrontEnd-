// src/theme/themes.ts
import { DefaultTheme } from 'styled-components'

export const lightTheme: DefaultTheme = {
  name: 'light',
  colors: {
    bg: '#f8f9fb',
    surface: '#ffffff',
    text: '#1a1a1a',
    mutedText: '#5a5a5a',
    primary: '#2266ff',
    accent: '#0044cc',
    border: 'rgba(0,0,0,0.08)',
    shadow: 'rgba(0,0,0,0.06)',

    success: '#009d5a',
    successBg: '#e6fff2',
    warning: '#ffb300',
    warningBg: '#fff8e1',
    danger: '#d93025',
    dangerBg: '#ffe8e6',
    info: '#007bff',
    infoBg: '#e6f0ff'
  }
}

export const darkTheme: DefaultTheme = {
  name: 'dark',
  colors: {
    bg: '#0e1217',
    surface: '#151b22',
    text: '#e6e6e6',
    mutedText: '#a6a6a6',
    primary: '#2b7cff',   // azul PYRA
    accent: '#4f9dff',
    border: 'rgba(255,255,255,0.08)',
    shadow: 'rgba(0,0,0,0.4)',

    success: '#4cc38a',
    successBg: '#1b2b21',
    warning: '#e6b800',
    warningBg: '#2a2512',
    danger: '#ff5c5c',
    dangerBg: '#2a1b1b',
    info: '#3399ff',
    infoBg: '#14263a'
  }
}

export const themes = { light: lightTheme, dark: darkTheme }
