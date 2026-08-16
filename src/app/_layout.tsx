import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { queryClient, setupOnlineManager, setupQueryPersistence, useQueryFocusManager } from '@/lib/query-client';
import { fontAssets } from '@/theme/fonts';
import { ThemePreferenceProvider, useThemePreference } from '@/theme/theme-preference-provider';
import { AppThemeProvider } from '@/theme/theme-provider';

SplashScreen.preventAutoHideAsync();
setupOnlineManager();
setupQueryPersistence();

export default function RootLayout() {
  useQueryFocusManager();

  return (
    <ThemePreferenceProvider>
      <RootLayoutNav />
    </ThemePreferenceProvider>
  );
}

function RootLayoutNav() {
  const { resolvedScheme } = useThemePreference();
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={resolvedScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppThemeProvider scheme={resolvedScheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="chat" options={{ presentation: 'fullScreenModal', headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ headerShown: true, title: 'Not found' }} />
          </Stack>
          <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
        </AppThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
