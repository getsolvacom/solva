import "./index.css";
import * as Sentry from "@sentry/react";

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

const systemThemeWatcher = window.matchMedia("(prefers-color-scheme: dark)");

function handleSystemThemeChange(e) {
  const saved = localStorage.getItem("solva-theme");
  if (!saved || saved === "system") {
    if (e.matches) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
  }
}

if (systemThemeWatcher.addEventListener) {
  systemThemeWatcher.addEventListener("change", handleSystemThemeChange);
} else {
  systemThemeWatcher.addListener(handleSystemThemeChange);
}

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
