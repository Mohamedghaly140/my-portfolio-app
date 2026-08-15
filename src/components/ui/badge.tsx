import { StyleSheet, Text, View } from 'react-native';

import { FontFamilies } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type BadgeProps = {
  label: string;
  variant?: 'accent' | 'muted' | 'code';
};

export function Badge({ label, variant = 'muted' }: BadgeProps) {
  const { colors } = useTheme();

  const palette =
    variant === 'accent'
      ? {
          backgroundColor: colors.accentDim,
          color: colors.accentText,
          borderColor: colors.accentBorder,
        }
      : variant === 'code'
        ? {
            backgroundColor: colors.surface,
            color: colors.code,
            borderColor: colors.border,
          }
        : {
            backgroundColor: colors.surface,
            color: colors.textMuted,
            borderColor: colors.border,
          };

  const styles = StyleSheet.create({
    root: {
      alignSelf: 'flex-start',
      backgroundColor: palette.backgroundColor,
      borderColor: palette.borderColor,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 2,
    },
    label: {
      color: palette.color,
      fontFamily: FontFamilies.display,
      fontSize: 12,
      lineHeight: 18,
    },
  });

  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
