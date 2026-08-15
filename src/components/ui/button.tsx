import { Link, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { FontFamilies } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type ButtonProps = {
  variant?: 'primary' | 'ghost';
  label: string;
  onPress?: () => void;
  href?: Href;
  disabled?: boolean;
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  label,
  onPress,
  href,
  disabled = false,
  loading = false,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';

  const styles = StyleSheet.create({
    root: {
      alignItems: 'center',
      backgroundColor: isPrimary ? colors.accent : 'transparent',
      borderColor: isPrimary ? 'transparent' : colors.accentText,
      borderWidth: isPrimary ? 0 : 1,
      flexDirection: 'row',
      gap: 6,
      justifyContent: 'center',
      minHeight: 44,
      opacity: isDisabled ? 0.5 : 1,
      paddingHorizontal: 24,
      paddingVertical: 10,
    },
    label: {
      // Primary fill uses accent with label colour bg — 11.96:1 in both schemes.
      color: isPrimary ? colors.bg : colors.accentText,
      fontFamily: FontFamilies.displayBold,
      fontSize: 14,
      lineHeight: 20,
    },
  });

  const content = (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={styles.root}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.bg : colors.accentText} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );

  if (href && !isDisabled) {
    return (
      <Link href={href} asChild>
        {content}
      </Link>
    );
  }

  return content;
}