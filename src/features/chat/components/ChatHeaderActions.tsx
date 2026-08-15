import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { lightImpact, selectionChanged } from "@/lib/haptics";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

type ChatHeaderActionsProps = {
  newChat: () => void;
};

export function ChatHeaderActions({ newChat }: ChatHeaderActionsProps) {
  const { colors } = useTheme();

  function handleNewChat() {
    lightImpact();
    newChat();
  }

  function handlePrivacy() {
    selectionChanged();
    router.push("/(tabs)/(home)/privacy");
  }

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityLabel="New chat"
        accessibilityRole="button"
        hitSlop={8}
        onPress={handleNewChat}
        style={styles.button}
      >
        <Ionicons color={colors.accentText} name="add-circle-outline" size={22} />
      </Pressable>
      <Pressable
        accessibilityLabel="Privacy and help"
        accessibilityRole="button"
        hitSlop={8}
        onPress={handlePrivacy}
        style={styles.button}
      >
        <Ionicons
          color={colors.accentText}
          name="information-circle-outline"
          size={22}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.one,
  },
  button: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
});
