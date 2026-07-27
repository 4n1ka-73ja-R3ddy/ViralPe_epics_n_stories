export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'viralpe.theme';

export function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  return 'light';
}

export function setStoredTheme(theme: ThemeMode): void {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
  window.dispatchEvent(new Event('theme-change'));
}

export function initTheme(): ThemeMode {
  const theme = getStoredTheme();
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
}
