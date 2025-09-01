import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from './colors';
import { useAppStore } from '../store/useAppStore';

type ThemeMode = 'light' | 'dark' | 'system';

export type AppTheme = {
  isDark: boolean;
  colors: typeof colors.light;
  mode: ThemeMode;
};

const ThemeContext = createContext<AppTheme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemDark = useColorScheme() === 'dark';
  const mode = useAppStore(s => s.settings.theme) as ThemeMode;
  const isDark = mode === 'system' ? systemDark : mode === 'dark';
  const value = useMemo<AppTheme>(
    () => ({ isDark, colors: isDark ? colors.dark : colors.light, mode }),
    [isDark, mode],
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

