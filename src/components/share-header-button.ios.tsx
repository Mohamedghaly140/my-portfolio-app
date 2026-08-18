import { Host } from "@expo/ui";
import { Button } from "@expo/ui/swift-ui";
import { buttonBorderShape, labelStyle } from "@expo/ui/swift-ui/modifiers";
import { StyleSheet, View } from "react-native";

import { lightImpact } from "@/lib/haptics";

type ShareHeaderButtonProps = {
  accessibilityLabel: string;
  onShare: () => void;
};

/** Icon-only header action that opens the native share sheet. */
export function ShareHeaderButton({
  accessibilityLabel,
  onShare,
}: ShareHeaderButtonProps) {
  function handlePress() {
    lightImpact();
    onShare();
  }

  return (
    <View style={styles.button}>
      <Host matchContents>
        <Button
          label={accessibilityLabel}
          modifiers={[labelStyle("iconOnly"), buttonBorderShape("circle")]}
          onPress={handlePress}
          systemImage="square.and.arrow.up"
        />
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  host: {},
});
