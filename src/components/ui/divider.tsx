import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type DividerProps = {
  inset?: boolean;
};

export function Divider({ inset = false }: DividerProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    root: {
      backgroundColor: colors.border,
      height: StyleSheet.hairlineWidth,
      marginHorizontal: inset ? Spacing.gutter : 0,
    },
  });

  return <View style={styles.root} />;
}
