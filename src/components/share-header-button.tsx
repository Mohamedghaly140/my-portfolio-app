import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import { lightImpact } from "@/lib/haptics";
import { useTheme } from "@/theme/theme-provider";

type ShareHeaderButtonProps = {
  accessibilityLabel: string;
  onShare: () => void;
};

/**
 * Plain-RN fallback for web (Metro resolves `.ios.tsx` / `.android.tsx` on
 * device, which render a native SwiftUI / Jetpack Compose header button).
 */
export function ShareHeaderButton({
  accessibilityLabel,
  onShare,
}: ShareHeaderButtonProps) {
  const { colors } = useTheme();

  function handlePress() {
    lightImpact();
    onShare();
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={handlePress}
      style={styles.button}
    >
      <Ionicons color={colors.accentText} name="share-outline" size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});
