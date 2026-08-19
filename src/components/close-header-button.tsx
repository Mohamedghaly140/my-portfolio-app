import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

type CloseHeaderButtonProps = {
  tintColor: string;
};

export function CloseHeaderButton({ tintColor }: CloseHeaderButtonProps) {
  return (
    <Pressable
      accessibilityLabel="Close"
      accessibilityRole="button"
      hitSlop={8}
      onPress={() => router.back()}
      style={styles.button}
    >
      <Ionicons color={tintColor} name="close" size={24} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});
