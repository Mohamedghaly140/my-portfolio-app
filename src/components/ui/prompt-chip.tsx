import { Pressable, StyleSheet, Text } from 'react-native';

import { FontFamilies } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type PromptChipProps = {
  label: string;
  onPress: () => void;
};

export function PromptChip({ label, onPress }: PromptChipProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    root: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: 'transparent',
      borderWidth: 1,
      justifyContent: 'center',
      minHeight: 44,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    rest: {
      borderColor: colors.border,
    },
    pressed: {
      borderColor: colors.accentText,
    },
    labelRest: {
      color: colors.textMuted,
      fontFamily: FontFamilies.display,
      fontSize: 12,
      lineHeight: 18,
    },
    labelPressed: {
      color: colors.accentText,
    },
  });

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        pressed ? styles.pressed : styles.rest,
      ]}
    >
      {({ pressed }) => (
        <Text style={[styles.labelRest, pressed && styles.labelPressed]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
