import { Host } from "@expo/ui";
import { Button } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  labelStyle,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { lightImpact } from "@/lib/haptics";

type BackHeaderButtonProps = {
  tintColor: string;
};

/** Icon-only header back control — circular glass chevron, no previous title. */
export function BackHeaderButton({ tintColor }: BackHeaderButtonProps) {
  function handlePress() {
    lightImpact();
    router.back();
  }

  return (
    <View style={styles.button}>
      <Host matchContents>
        <Button
          label="Back"
          modifiers={[
            labelStyle("iconOnly"),
            buttonBorderShape("circle"),
            tint(tintColor),
          ]}
          onPress={handlePress}
          systemImage="chevron.backward"
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
  host: {
    // height: 44,
    // width: 44,
  },
});
