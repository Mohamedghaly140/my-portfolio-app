import { StyleSheet, View } from 'react-native';

import { Reveal, Text } from '@/components/ui';
import { Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

import { STATS } from '../constants';

export function StatsStrip() {
  const { colors } = useTheme();

  return (
    <Reveal>
      <View style={[styles.grid, { borderColor: colors.border }]}>
        {STATS.map((stat, index) => (
          <View
            key={stat.label}
            style={[
              styles.cell,
              {
                borderColor: colors.border,
                borderRightWidth: index % 2 === 0 ? 1 : 0,
                borderBottomWidth: index < 2 ? 1 : 0,
              },
            ]}
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
  grid: {
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: Spacing.four,
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four + Spacing.two,
    width: '50%',
  },
  value: {
    fontSize: 36,
    lineHeight: 44,
  },
  label: {
    marginTop: Spacing.two,
  },
});
