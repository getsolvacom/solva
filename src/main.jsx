import * as Sentry from "@sentry/react";

function injectThemeVars() {
  const style = document.createElement('style');
  style.id = 'solva-theme-vars';
  style.textContent = `
    :root {
      --bg: #060008;
      --surface: #0C000F;
      --card: #110014;
      --border: #200026;
      --border-hi: #3D0050;
      --text: #F5EAF2;
      --sub: #D2B4C8;
      --muted: #9C7A93;
      --dim: #1A0020;
    }
    html.light {
      --bg: #FFF5F8;
      --surface: #FFFFFF;
      --card: #FFF0F5;
      --border: rgba(78,2,105,.12);
      --border-hi: rgba(78,2,105,.25);
      --text: #1A0010;
      --sub: #7A3060;
      --muted: #B070A0;
      --dim: #FFE8EF;
    }
    * { transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease; }
  `;
  document.head.appendChild(style);

  (function applyInitialTheme() {
    const saved = localStorage.getItem("solva-theme");
    if (!saved || saved === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
      }
    } else if (saved === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  })();
}

injectThemeVars();

Sentry.init({
  dsn: "https://d6153b9f9fe01dd4e83e24a200ecdbfc0b4511604278891088.ingest.de.sentry.io/4511604313555824",
  integrations: [
    Sentry.replayIntegration(),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Analytics />
    </BrowserRouter>
  </StrictMode>,
)
