import type { ErrorBoundaryProps } from 'expo-router';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { Colors } from '@/theme/colors';
import { FontFamilies, Typography } from '@/theme/typography';

/**
 * Root-level render-error fallback, wired as `src/app/_layout.tsx`'s
 * expo-router `ErrorBoundary` export. Deliberately does NOT use `useTheme()`
 * or any `src/components/ui` primitive — this replaces RootLayout's entire
 * subtree, including `AppThemeProvider`, so there is no guaranteed theme
 * context by the time this renders. Reads raw tokens (`Colors`, `Typography`)
 * and the system color scheme directly instead.
 */
export function RootErrorFallback({ error, retry }: ErrorBoundaryProps) {
  const systemScheme = useColorScheme();
  const colors = Colors[systemScheme === 'light' ? 'light' : 'dark'];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Something went wrong</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>
        {error.message || 'An unexpected error occurred.'}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => void retry()}
        style={[styles.button, { backgroundColor: colors.accent }]}
      >
        <Text style={[styles.buttonLabel, { color: colors.onAccent }]}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontFamily: FontFamilies.displayBold,
    fontSize: Typography.heading.fontSize,
    lineHeight: Typography.heading.lineHeight,
    textAlign: 'center',
  },
  message: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonLabel: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: Typography.body.fontSize,
  },
});
