import { useState, useEffect } from 'react';

const STORAGE_KEY = 'solva-theme';

function getOsDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyResolved(mode) {
  const dark = mode === 'dark' || (mode === 'system' && getOsDark());
  if (dark) {
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'system';
  });

  useEffect(() => {
    applyResolved(theme);
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyResolved('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  function setTheme(next) {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }

  return { theme, setTheme };
}
