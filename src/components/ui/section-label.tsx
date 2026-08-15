import { StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/theme-provider';

export type SectionLabelProps = {
  children: string;
};

export function SectionLabel({ children }: SectionLabelProps) {
  const { colors, typography } = useTheme();

  const styles = StyleSheet.create({
    root: {
      ...typography.label,
      color: colors.accentText,
    },
  });

  return <Text style={styles.root}>{children}</Text>;
}
