import {
  Text as RNText,
  StyleSheet,
  type AccessibilityRole,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import { Typography, type TypeRole } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type TextProps = {
  role?: TypeRole;
  color?: 'text' | 'textMuted' | 'accent' | 'accentText' | 'code' | 'danger';
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
  const { colors } = useTheme();

  // `color="accent"` must resolve to accentText, never the raw accent.
  // The raw accent is 1.58:1 on the light background — fills, dots and rules only.
  const resolvedColor =
    color === 'accent' || color === 'accentText'
      ? colors.accentText
      : colors[color];

  return (
    <RNText
      accessibilityRole={accessibilityRole}
      numberOfLines={numberOfLines}
      style={[styles[role], { color: resolvedColor }, style]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  title: Typography.title,
  heading: Typography.heading,
  subheading: Typography.subheading,
  body: Typography.body,
  bodyMedium: Typography.bodyMedium,
  small: Typography.small,
  label: Typography.label,
  code: Typography.code,
});
