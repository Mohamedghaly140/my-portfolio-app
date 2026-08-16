import { storage } from '@/lib/storage/mmkv';

const THEME_PREFERENCE_KEY = 'mg_theme_preference';

export type ThemePreference = 'system' | 'light' | 'dark';

function isThemePreference(value: string): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export async function getStoredThemePreference(): Promise<ThemePreference | null> {
  const value = storage.getString(THEME_PREFERENCE_KEY);
  if (value === undefined || !isThemePreference(value)) {
    return null;
  }
  return value;
}

export async function setStoredThemePreference(value: ThemePreference): Promise<void> {
  storage.set(THEME_PREFERENCE_KEY, value);
}

export async function clearStoredThemePreference(): Promise<void> {
  storage.remove(THEME_PREFERENCE_KEY);
}
