// src/theme/GlobalStyle.ts
import { createGlobalStyle } from 'styled-components';

/**
 * Solo definimos variables cuando el tema es "dark".
 * El tema "light" NO toca nada: tu SCSS existente sigue mandando.
 * AppThemeProvider ya pone data-theme="light|dark" en <html>.
 */
export const GlobalStyle = createGlobalStyle`
  /* --------- DARK MODE (aplica solo cuando el switch está activo) --------- */
  html[data-theme='dark'] {
    color-scheme: dark;

    /* Tokens base */
    --bg: ${({ theme }) => theme.colors.bg};
    --surface: ${({ theme }) => theme.colors.surface};
    --text: ${({ theme }) => theme.colors.text};
    --mutedText: ${({ theme }) => theme.colors.mutedText};
    --primary: ${({ theme }) => theme.colors.primary};
    --accent: ${({ theme }) => theme.colors.accent};
    --border: ${({ theme }) => theme.colors.border};
    --shadow: ${({ theme }) => theme.colors.shadow};

    /* (Opcionales) tokens extra de dark si los tienes en el theme */
    --primaryHover: ${({ theme }) => (theme as any).colors?.primaryHover};
    --primaryActive: ${({ theme }) => (theme as any).colors?.primaryActive};
    --successBg: ${({ theme }) => (theme as any).colors?.successBg};
    --successBorder: ${({ theme }) => (theme as any).colors?.successBorder};
    --warningBg: ${({ theme }) => (theme as any).colors?.warningBg};
    --warningBorder: ${({ theme }) => (theme as any).colors?.warningBorder};
    --dangerBg: ${({ theme }) => (theme as any).colors?.dangerBg};
    --dangerBorder: ${({ theme }) => (theme as any).colors?.dangerBorder};
    --infoBg: ${({ theme }) => (theme as any).colors?.infoBg};
    --infoBorder: ${({ theme }) => (theme as any).colors?.infoBorder};
  }

  /* Fondo/Texto globales: solo forzamos cuando es dark */
  html[data-theme='dark'],
  html[data-theme='dark'] body,
  html[data-theme='dark'] #root {
    background: var(--bg);
    color: var(--text);
  }

  /* Reset general que no cambia tu paleta de light */
  * { box-sizing: border-box; }
`;
