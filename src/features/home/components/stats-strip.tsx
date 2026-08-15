import { StyleSheet, View } from 'react-native';

import { Reveal, Text } from '@/components/ui';
import { Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

import { STATS } from '../constants';

export function StatsStrip() {
  const { colors } = useTheme();

  return (
    <Reveal>
      <View style={styles.row}>
        {STATS.map((stat) => (
          <View
            key={stat.label}
            style={[styles.cell, { borderColor: colors.border }]}
          >
            <Text color="accent" role="title" style={styles.value}>
              {stat.value}
            </Text>
            <Text color="textMuted" role="label" style={styles.label}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginVertical: Spacing.four,
  },
  cell: {
    alignItems: 'center',
    borderWidth: 1,
    flexBasis: 72,
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four + Spacing.two,
  },
  value: {
    fontSize: 36,
    lineHeight: 44,
  },
  label: {
    marginTop: Spacing.two,
  },
});
