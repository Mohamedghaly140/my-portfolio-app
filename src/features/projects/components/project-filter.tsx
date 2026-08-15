import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { FontFamilies, Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type ProjectFilterProps = {
  categories: string[];
  active: string;
  onChange: (label: string) => void;
};

function FilterChip({
  label,
  active,
  onChange,
}: {
  label: string;
  active: boolean;
  onChange: (label: string) => void;
}) {
  const { colors } = useTheme();

  function handlePress() {
    onChange(label);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={handlePress}
      style={[
        styles.chip,
        active
          ? {
              backgroundColor: colors.accentDim,
              borderColor: colors.accentBorder,
            }
          : {
              backgroundColor: 'transparent',
              borderColor: colors.border,
            },
      ]}
    >
      <Text
        style={[
          styles.chipLabel,
          { color: active ? colors.accentText : colors.textMuted },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ProjectFilter({ categories, active, onChange }: ProjectFilterProps) {
  const labels = ['All', ...categories];

  return (
    <ScrollView
      contentContainerStyle={styles.row}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {labels.map((label) => (
        <FilterChip
          key={label}
          active={active === label}
          label={label}
          onChange={onChange}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingBottom: Spacing.one,
  },
  chip: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipLabel: {
    fontFamily: FontFamilies.display,
    fontSize: 12,
    lineHeight: 18,
  },
});
