/**
 * @file GlobalStyle.ts
 * @description Global CSS baseline shared across light and dark themes.
 */
import { createGlobalStyle } from 'styled-components'

/**
 * Styled-components global stylesheet that maps design tokens to CSS variables.
 */
export const GlobalStyle = createGlobalStyle`
  /* Theme variables activated via <html data-theme="..."> */
  html[data-theme='light'] {
    --bg: ${({ theme }) => theme.colors.bg};
    --surface: ${({ theme }) => theme.colors.surface};
    --text: ${({ theme }) => theme.colors.text};
    --mutedText: ${({ theme }) => theme.colors.mutedText};
    --primary: ${({ theme }) => theme.colors.primary};
    --accent: ${({ theme }) => theme.colors.accent};
    --border: ${({ theme }) => theme.colors.border};
    --shadow: ${({ theme }) => theme.colors.shadow};
    --card: ${({ theme }) => theme.colors.surface};

    --success: ${({ theme }) => theme.colors.success ?? '#009d5a'};
    --warning: ${({ theme }) => theme.colors.warning ?? '#ffb300'};
    --danger:  ${({ theme }) => theme.colors.danger ?? '#d93025'};
    --info:    ${({ theme }) => theme.colors.info ?? '#007bff'};
  }

  html[data-theme='dark'] {
    color-scheme: dark;
    --bg: ${({ theme }) => theme.colors.bg};
    --surface: ${({ theme }) => theme.colors.surface};
    --text: ${({ theme }) => theme.colors.text};
    --mutedText: ${({ theme }) => theme.colors.mutedText};
    --primary: ${({ theme }) => theme.colors.primary};
    --accent: ${({ theme }) => theme.colors.accent};
    --border: ${({ theme }) => theme.colors.border};
    --shadow: ${({ theme }) => theme.colors.shadow};
    --card: ${({ theme }) => theme.colors.surface};

    --success: ${({ theme }) => theme.colors.success ?? '#4cc38a'};
    --warning: ${({ theme }) => theme.colors.warning ?? '#e6b800'};
    --danger:  ${({ theme }) => theme.colors.danger ?? '#ff5c5c'};
    --info:    ${({ theme }) => theme.colors.info ?? '#3399ff'};
  }

  *, *::before, *::after {
    box-sizing: border-box;
    transition: background-color .25s ease, color .25s ease, border-color .25s ease;
  }

  html, body, #root { height: 100%; }

  html, body, #root {
    background-color: var(--bg) !important;
    color: var(--text);
  }

  body {
    margin: 0;
    font-family: 'Poppins','Segoe UI',system-ui,-apple-system,sans-serif;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  h1,h2,h3,h4,h5,h6 { color: var(--text); margin: 0; font-weight: 600; }
  p,span,li,small { color: var(--mutedText); }

  a { color: var(--primary); text-decoration: none; }
  a:hover { color: var(--accent); }

  input, select, textarea, button {
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--primary);
  }

  ::selection { background: var(--primary); color: #fff; }

  img, video { max-width: 100%; height: auto; }

  @media (max-width: 768px) {
    h1 { font-size: 1.6rem; }
    h2 { font-size: 1.3rem; }
  }
`
