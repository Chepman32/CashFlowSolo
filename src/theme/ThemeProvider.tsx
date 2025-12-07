import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from './colors';
import { useAppStore } from '../store/useAppStore';
import type { ThemeMode } from '../types';

export type AppTheme = {
  isDark: boolean;
  colors: typeof colors.light;
  mode: ThemeMode;
};

const ThemeContext = createContext<AppTheme | null>(null);

function getThemeColors(mode: ThemeMode, systemDark: boolean): typeof colors.light {
  switch (mode) {
    case 'light':
      return colors.light;
    case 'dark':
      return colors.dark;
    case 'solar':
      return colors.solar;
    case 'mono':
      return colors.mono;
    case 'system':
    default:
      return systemDark ? colors.dark : colors.light;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemDark = useColorScheme() === 'dark';
  const mode = useAppStore(s => s.settings.theme) as ThemeMode;
  const isDark = mode === 'system' ? systemDark : mode === 'dark';
  const themeColors = getThemeColors(mode, systemDark);
  const value = useMemo<AppTheme>(
    () => ({ isDark, colors: themeColors, mode }),
    [isDark, themeColors, mode],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): AppTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    const isDark = useColorScheme() === 'dark';
    return { isDark, colors: isDark ? colors.dark : colors.light, mode: 'system' };
  }
  return ctx;
}

