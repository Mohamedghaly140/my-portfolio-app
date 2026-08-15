import { createContext, use, type ReactNode } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { type ColorSchemeName, type ThemeColors } from './colors';
import { getTheme, type AppTheme } from './index';

const ThemeContext = createContext<AppTheme | null>(null);

export function resolveScheme(
  override: ColorSchemeName | undefined,
  system: string | null | undefined,
): ColorSchemeName {
  if (override === 'light' || override === 'dark') {
    return override;
  }
  if (system === 'light' || system === 'dark') {
    return system;
  }
  return 'dark';
}

export function AppThemeProvider({
  children,
  scheme,
}: {
  children: ReactNode;
  scheme?: ColorSchemeName;
}) {
  const systemScheme = useColorScheme();
  const theme = getTheme(resolveScheme(scheme, systemScheme));

  return <ThemeContext value={theme}>{children}</ThemeContext>;
}

export function useTheme(): AppTheme {
  const theme = use(ThemeContext);
  if (theme === null) {
    throw new Error('useTheme must be used within AppThemeProvider');
  }
  return theme;
}

export function useThemeColors(): ThemeColors {
  return useTheme().colors;
}
