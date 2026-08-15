import { StyleSheet, Text } from 'react-native';

import { Typography } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type SectionLabelProps = {
  children: string;
};

export function SectionLabel({ children }: SectionLabelProps) {
  const { colors } = useTheme();

  return <Text style={[styles.root, { color: colors.accentText }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  root: {
    ...Typography.label,
  },
});
