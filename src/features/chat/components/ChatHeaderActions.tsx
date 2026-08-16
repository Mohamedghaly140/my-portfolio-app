import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { lightImpact, selectionChanged } from "@/lib/haptics";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

type ChatHeaderActionsProps = {
  newChat: () => void;
  isStartingNewChat: boolean;
};

export function ChatHeaderActions({
  newChat,
  isStartingNewChat,
}: ChatHeaderActionsProps) {
  const { colors } = useTheme();

  function handleNewChat() {
    if (isStartingNewChat) return;
    lightImpact();
    newChat();
  }

  function handlePrivacy() {
    selectionChanged();
    router.push("/chat/privacy");
  }

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityLabel="New chat"
        accessibilityRole="button"
        accessibilityState={{ disabled: isStartingNewChat, busy: isStartingNewChat }}
        disabled={isStartingNewChat}
        hitSlop={8}
        onPress={handleNewChat}
        style={styles.button}
      >
        {isStartingNewChat ? (
          <ActivityIndicator color={colors.accentText} size="small" />
        ) : (
          <Ionicons
            color={colors.accentText}
            name="add-circle-outline"
            size={22}
          />
        )}
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
