import { Host } from "@expo/ui";
import { Button } from "@expo/ui/swift-ui";
import { buttonBorderShape, labelStyle } from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { selectionChanged } from "@/lib/haptics";

/** Icon-only header action that opens the Privacy screen. */
export function PrivacyHeaderButton() {
  function handlePress() {
    selectionChanged();
    router.push("/(tabs)/contact/privacy");
  }

  return (
    <View style={styles.button}>
      <Host matchContents>
        <Button
          label="Privacy"
          modifiers={[labelStyle("iconOnly"), buttonBorderShape("circle")]}
          onPress={handlePress}
          systemImage="info.circle"
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
});
