import { Host } from "@expo/ui";
import { FloatingActionButton, RNHostView } from "@expo/ui/jetpack-compose";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { lightImpact } from "@/lib/haptics";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

const FAB_ICON_SIZE = 38;
// Clearance above the safe-area inset needed to clear the floating native
// tab bar pill, whose height isn't exposed to JS by expo-router.
const TAB_BAR_CLEARANCE = 96;

/** Native Jetpack Compose chat FAB — a Material 3 `FloatingActionButton`. */
export function ChatFab() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  function handlePress() {
    lightImpact();
    router.push("/chat");
  }

  return (
    <Host
      matchContents
      accessibilityLabel="Open chat"
      accessibilityRole="button"
      style={[styles.host, { bottom: insets.bottom + TAB_BAR_CLEARANCE }]}
    >
      <FloatingActionButton
        containerColor={colors.accent}
        onClick={handlePress}
      >
        <FloatingActionButton.Icon>
          <RNHostView matchContents>
            <Ionicons
              color={colors.onAccent}
              name="sparkles"
              size={FAB_ICON_SIZE}
            />
          </RNHostView>
        </FloatingActionButton.Icon>
      </FloatingActionButton>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    right: Spacing.gutter,
    zIndex: 100,
  },
});
