import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Temporary M0 scaffolding: proves the five-tab tree boots and each route
 * resolves. Replaced screen by screen in M3, M5, M6 and M7.
 */
export function PlaceholderScreen({ title }: { title: string }) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
});
