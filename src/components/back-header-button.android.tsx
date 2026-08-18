import { Host } from "@expo/ui";
import { IconButton, RNHostView, Shape } from "@expo/ui/jetpack-compose";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet } from "react-native";

import { lightImpact } from "@/lib/haptics";

type BackHeaderButtonProps = {
  tintColor: string;
};

/** Icon-only header back control — circular chevron, no previous title. */
export function BackHeaderButton({ tintColor }: BackHeaderButtonProps) {
  function handlePress() {
    lightImpact();
    router.back();
  }

  return (
    <Host
      accessibilityLabel="Back"
      accessibilityRole="button"
      matchContents
      style={styles.host}
    >
      <IconButton
        colors={{ contentColor: tintColor }}
        onClick={handlePress}
        shape={Shape.Circle({ radius: 1 })}
      >
        <RNHostView matchContents>
          <Ionicons color={tintColor} name="chevron-back" size={22} />
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
