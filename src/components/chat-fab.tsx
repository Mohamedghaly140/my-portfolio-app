import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { lightImpact } from '@/lib/haptics';
import { BottomTabInset, Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

const FAB_SIZE = 56;
const FAB_ICON_SIZE = 26;

export function ChatFab() {
  const { colors } = useTheme();

  function handlePress() {
    lightImpact();
    router.push('/chat');
  }

  return (
    <Pressable
      accessibilityLabel="Open chat"
      accessibilityRole="button"
      onPress={handlePress}
      style={[styles.root, { backgroundColor: colors.accent }]}
    >
      <Ionicons color={colors.onAccent} name="chatbubble-ellipses" size={FAB_ICON_SIZE} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    bottom: BottomTabInset + Spacing.three,
    height: FAB_SIZE,
    justifyContent: 'center',
    position: 'absolute',
    right: Spacing.gutter,
    width: FAB_SIZE,
    zIndex: 100,
  },
});
