import { Pressable, StyleSheet, Text } from 'react-native';

import { FontFamilies } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type PromptChipProps = {
  label: string;
  onPress: () => void;
};

export function PromptChip({ label, onPress }: PromptChipProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        { borderColor: pressed ? colors.accentText : colors.border },
      ]}
    >
      {({ pressed }) => (
        <Text style={[styles.label, { color: pressed ? colors.accentText : colors.textMuted }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    fontFamily: FontFamilies.display,
    fontSize: 12,
    lineHeight: 18,
  },
});
