import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { lightImpact } from '@/lib/haptics';
import { Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

const FAB_SIZE = 56;
const FAB_ICON_SIZE = 26;
// Clearance above the safe-area inset needed to clear the floating native
// tab bar pill, whose height isn't exposed to JS by expo-router.
const TAB_BAR_CLEARANCE = 96;

export function ChatFab() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  function handlePress() {
    lightImpact();
    router.push('/chat');
  }

  return (
    <Pressable
      accessibilityLabel="Open chat"
      accessibilityRole="button"
      onPress={handlePress}
      style={[
        styles.root,
        { backgroundColor: colors.accent, bottom: insets.bottom + TAB_BAR_CLEARANCE },
      ]}
    >
      <Ionicons color={colors.onAccent} name="sparkles" size={FAB_ICON_SIZE} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderRadius: FAB_SIZE / 2,
    height: FAB_SIZE,
    justifyContent: 'center',
    position: 'absolute',
    right: Spacing.gutter,
    width: FAB_SIZE,
    zIndex: 100,
  },
});
