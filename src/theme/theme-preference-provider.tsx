import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getStoredThemePreference,
  setStoredThemePreference,
  type ThemePreference,
} from '@/lib/preferences/theme';

import { type ColorSchemeName } from './colors';
import { resolveScheme } from './theme-provider';

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  resolvedScheme: ColorSchemeName;
  setPreference: (preference: ThemePreference) => void;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const systemScheme = useColorScheme();
  const resolvedScheme = resolveScheme(
    preference === 'system' ? undefined : preference,
    systemScheme,
  );

  useEffect(() => {
    let cancelled = false;

    void getStoredThemePreference().then((stored) => {
      if (!cancelled && stored !== null) {
        setPreferenceState(stored);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function setPreference(next: ThemePreference) {
    setPreferenceState(next);
    void setStoredThemePreference(next).catch(() => {
      // Persistence failure should not block the in-memory preference.
    });
  }

  return (
    <ThemePreferenceContext value={{ preference, resolvedScheme, setPreference }}>
      {children}
    </ThemePreferenceContext>
  );
}

export function useThemePreference(): ThemePreferenceContextValue {
  const value = use(ThemePreferenceContext);
  if (value === null) {
    throw new Error('useThemePreference must be used within ThemePreferenceProvider');
  }
  return value;
}
