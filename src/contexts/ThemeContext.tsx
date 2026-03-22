import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface ThemeContextType {
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_ACCENT = '#4F46E5';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColorState] = useState(DEFAULT_ACCENT);

  useEffect(() => {
    const savedColor = Cookies.get('looopd-accent-color');
    if (savedColor) {
      setAccentColorState(savedColor);
    }
  }, []);

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    Cookies.set('looopd-accent-color', color, { expires: 365 });
  };

  return (
    <ThemeContext.Provider value={{ accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helpers
export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function darkenColor(hex: string, percent: number) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const r = Math.max(0, Math.floor(rgb.r * (1 - percent / 100)));
  const g = Math.max(0, Math.floor(rgb.g * (1 - percent / 100)));
  const b = Math.max(0, Math.floor(rgb.b * (1 - percent / 100)));
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
