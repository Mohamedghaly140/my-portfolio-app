import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme/theme-provider';

export type CardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Card({ children, onPress, style, accessibilityLabel }: CardProps) {
  const { colors } = useTheme();

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.root,
          {
            backgroundColor: colors.surface,
            borderColor: pressed ? colors.borderPressed : colors.border,
          },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
  },
});
