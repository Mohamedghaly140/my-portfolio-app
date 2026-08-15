import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type DividerProps = {
  inset?: boolean;
};

export function Divider({ inset = false }: DividerProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.border, marginHorizontal: inset ? Spacing.gutter : 0 },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    height: StyleSheet.hairlineWidth,
  },
});
