import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { lightImpact } from "@/lib/haptics";

type BackHeaderButtonProps = {
  tintColor: string;
};

/**
 * Plain-RN fallback for web (Metro resolves `.ios.tsx` / `.android.tsx` on
 * device, which render a native SwiftUI / Jetpack Compose header button).
 */
export function BackHeaderButton({ tintColor }: BackHeaderButtonProps) {
  function handlePress() {
    lightImpact();
    router.back();
  }

  return (
    <Pressable
      accessibilityLabel="Back"
      accessibilityRole="button"
      hitSlop={8}
      onPress={handlePress}
      style={styles.button}
    >
      <Ionicons color={tintColor} name="chevron-back" size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});
