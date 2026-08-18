import { Host } from "@expo/ui";
import { Button, Image } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonBorderShape,
  buttonStyle,
  frame,
  shadow,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { lightImpact } from "@/lib/haptics";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

const FAB_SIZE = 56;
const FAB_ICON_SIZE = 38;
// Clearance above the safe-area inset needed to clear the floating native
// tab bar pill, whose height isn't exposed to JS by expo-router.
const TAB_BAR_CLEARANCE = 96;

/** Native SwiftUI chat FAB — a bordered-prominent circular Button. */
export function ChatFab() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  function handlePress() {
    lightImpact();
    router.push("/chat");
  }

  return (
    <View style={[styles.root, { bottom: insets.bottom + TAB_BAR_CLEARANCE }]}>
      <Host matchContents style={styles.host}>
        <Button
          onPress={handlePress}
          modifiers={[
            buttonStyle("borderedProminent"),
            buttonBorderShape("circle"),
            tint(colors.accent),
            frame({ width: FAB_SIZE, height: FAB_SIZE }),
            shadow({ radius: 8, y: 4 }),
            accessibilityLabel("Open chat"),
          ]}
        >
          <Image
            color={colors.onAccent}
            size={FAB_ICON_SIZE}
            systemName="sparkles"
          />
        </Button>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    right: Spacing.gutter,
    zIndex: 100,
  },
  host: {
    height: FAB_SIZE,
    width: FAB_SIZE,
  },
});
