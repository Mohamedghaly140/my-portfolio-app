import { StyleSheet, View } from 'react-native';

import { Divider, Text } from '@/components/ui';
import { languages } from '@/data/skills';
import { Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export function LanguagesSection() {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <View style={styles.heading}>
        <Text color="accent" role="label">
          Languages
        </Text>
        <View style={styles.dividerGrow}>
          <Divider />
        </View>
      </View>

      <View style={styles.grid}>
        {languages.map((language) => (
          <View
            key={language.name}
            style={[styles.item, { borderLeftColor: colors.accent }]}
          >
            <Text role="bodyMedium">{language.name}</Text>
            <Text color="textMuted" role="small">
              {language.level}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.three,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two + Spacing.half,
  },
  dividerGrow: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two + Spacing.half,
  },
  item: {
    borderLeftWidth: 2,
    flexBasis: '47%',
    flexGrow: 1,
    gap: Spacing.half,
    paddingLeft: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
