/**
 * @file main.tsx
 * @summary Application bootstrap that mounts the root React tree with theming.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.scss'
import { AppThemeProvider } from './theme/AppThemeProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </React.StrictMode>
)
