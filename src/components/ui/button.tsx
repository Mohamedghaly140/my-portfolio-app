import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { lightImpact } from '@/lib/haptics';
import { FontFamilies } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type ButtonProps = {
  variant?: 'primary' | 'ghost';
  label: string;
  icon?: {
    name: React.ComponentProps<typeof Ionicons>['name'];
    position?: 'leading' | 'trailing';
  };
  onPress?: () => void;
  href?: Href;
  disabled?: boolean;
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  label,
  icon,
  onPress,
  href,
  disabled = false,
  loading = false,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';
  const labelColor = isPrimary ? colors.onAccent : colors.accentText;
  const iconPosition = icon?.position ?? 'trailing';

  function handlePress() {
    if (isPrimary && !isDisabled) {
      lightImpact();
    }
    onPress?.();
  }

  const content = (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={handlePress}
      style={[
        styles.root,
        {
          backgroundColor: isPrimary ? colors.accent : 'transparent',
          borderColor: isPrimary ? 'transparent' : colors.accentText,
          borderWidth: isPrimary ? 0 : 1,
          opacity: isDisabled ? 0.5 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <>
          {icon && iconPosition === 'leading' ? (
            <Ionicons color={labelColor} name={icon.name} size={14} />
          ) : null}
          <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
          {icon && iconPosition === 'trailing' ? (
            <Ionicons color={labelColor} name={icon.name} size={14} />
          ) : null}
        </>
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

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  label: {
    fontFamily: FontFamilies.displayBold,
    fontSize: 14,
    lineHeight: 20,
  },
});
