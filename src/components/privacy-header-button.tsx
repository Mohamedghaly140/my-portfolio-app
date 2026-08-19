import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { selectionChanged } from "@/lib/haptics";
import { useTheme } from "@/theme/theme-provider";

/**
 * Plain-RN fallback for web (Metro resolves `.ios.tsx` / `.android.tsx` on
 * device, which render a native SwiftUI / Jetpack Compose header button).
 */
export function PrivacyHeaderButton() {
  const { colors } = useTheme();

  function handlePress() {
    selectionChanged();
    router.push("/(tabs)/contact/privacy");
  }

  return (
    <Pressable
      accessibilityLabel="Privacy"
      accessibilityRole="button"
      hitSlop={8}
      onPress={handlePress}
      style={styles.button}
    >
      <Ionicons
        color={colors.accentText}
        name="information-circle-outline"
        size={22}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});
