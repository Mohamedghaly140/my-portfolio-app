import { Host } from "@expo/ui";
import { IconButton, RNHostView, Shape } from "@expo/ui/jetpack-compose";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet } from "react-native";

import { selectionChanged } from "@/lib/haptics";
import { useTheme } from "@/theme/theme-provider";

/** Icon-only header action that opens the Privacy screen. */
export function PrivacyHeaderButton() {
  const { colors } = useTheme();

  function handlePress() {
    selectionChanged();
    router.push("/(tabs)/contact/privacy");
  }

  return (
    <Host
      accessibilityLabel="Privacy"
      accessibilityRole="button"
      matchContents
      style={styles.host}
    >
      <IconButton
        colors={{ contentColor: colors.accentText }}
        onClick={handlePress}
        shape={Shape.Circle({ radius: 1 })}
      >
        <RNHostView matchContents>
          <Ionicons
            color={colors.accentText}
            name="information-circle-outline"
            size={22}
          />
        </RNHostView>
      </IconButton>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    height: 44,
    width: 44,
  },
});
