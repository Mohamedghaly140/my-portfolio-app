import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/theme';
import { useThemeColors } from '@/theme/theme-provider';

export default function NotFoundScreen() {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>This screen does not exist.</Text>
      <Link href="/" style={[styles.link, { color: colors.textMuted }]}>
        Go to home
      </Link>
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
  link: {
    fontSize: 16,
  },
});
