import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/theme-provider';

export type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  gutter?: boolean;
  safe?: boolean;
};

/**
 * When `scroll` is true the ScrollView must be this component's first child
 * (not wrapped in a View) — NativeTabs relies on that for tab-bar transparency
 * and tap-to-scroll-to-top. Do not add manual safe-area insets; NativeTabs
 * already applies them and `safe` only toggles contentInsetAdjustmentBehavior.
 */
export function Screen({
  children,
  scroll = true,
  gutter = true,
  safe = true,
}: ScreenProps) {
  const { colors, spacing } = useTheme();

  const styles = StyleSheet.create({
    root: {
      backgroundColor: colors.bg,
      flex: 1,
      paddingHorizontal: gutter ? spacing.gutter : 0,
    },
    scroll: {
      backgroundColor: colors.bg,
      flex: 1,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: gutter ? spacing.gutter : 0,
    },
  });

  if (scroll) {
    return (
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior={safe ? 'automatic' : 'never'}
        style={styles.scroll}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={styles.root}>{children}</View>;
}
