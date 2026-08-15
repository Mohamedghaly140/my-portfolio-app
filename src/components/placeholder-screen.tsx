import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/theme';
import { useThemeColors } from '@/theme/theme-provider';

/**
 * Temporary M0 scaffolding: proves the five-tab tree boots and each route
 * resolves. Replaced screen by screen in M3, M5, M6 and M7.
 */
export function PlaceholderScreen({ title }: { title: string }) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {__DEV__ ? (
        <Link href="/gallery" style={[styles.galleryLink, { color: colors.accentText }]}>
          Token gallery
        </Link>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  galleryLink: {
    fontSize: 14,
  },
});
