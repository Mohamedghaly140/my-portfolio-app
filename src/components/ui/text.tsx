import {
  Text as RNText,
  StyleSheet,
  type AccessibilityRole,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import { type TypeRole } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type TextProps = {
  role?: TypeRole;
  color?: 'text' | 'textMuted' | 'accent' | 'accentText' | 'code';
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  accessibilityRole?: AccessibilityRole;
};

export function Text({
  role = 'body',
  color = 'text',
  children,
  style,
  numberOfLines,
  accessibilityRole,
}: TextProps) {
  const { colors, typography } = useTheme();

  // `color="accent"` must resolve to accentText, never the raw accent.
  // The raw accent is 1.58:1 on the light background — fills, dots and rules only.
  const resolvedColor =
    color === 'accent' || color === 'accentText'
      ? colors.accentText
      : colors[color];

  const styles = StyleSheet.create({
    root: {
      ...typography[role],
      color: resolvedColor,
    },
  });

  return (
    <RNText
      accessibilityRole={accessibilityRole}
      numberOfLines={numberOfLines}
      style={[styles.root, style]}
    >
      {children}
    </RNText>
  );
}
