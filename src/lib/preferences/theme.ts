import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_PREFERENCE_KEY = 'mg_theme_preference';

export type ThemePreference = 'system' | 'light' | 'dark';

function isThemePreference(value: string): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export async function getStoredThemePreference(): Promise<ThemePreference | null> {
  const value = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
  if (value === null || !isThemePreference(value)) {
    return null;
  }
  return value;
}

export async function setStoredThemePreference(value: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(THEME_PREFERENCE_KEY, value);
}

export async function clearStoredThemePreference(): Promise<void> {
  await AsyncStorage.removeItem(THEME_PREFERENCE_KEY);
}
