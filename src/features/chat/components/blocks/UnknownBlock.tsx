import { StyleSheet, View } from "react-native";

import { Text } from "@/components/ui";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

export function UnknownBlock() {
  const { colors } = useTheme();

  return (
    <View
      accessibilityRole="text"
      style={[
        styles.root,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text color="textMuted" role="small">
        {"This part of the reply couldn't be displayed"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
