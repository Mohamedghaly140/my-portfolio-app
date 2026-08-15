import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/ui";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

export type ErrorNoticeProps = {
  error: { message: string; retryable: boolean } | null;
  onRetry: () => void;
};

export function ErrorNotice({ error, onRetry }: ErrorNoticeProps) {
  const { colors } = useTheme();

  if (!error) return null;

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.root,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text role="body">{error.message}</Text>
      {error.retryable ? (
        <View style={styles.actions}>
          <Button label="Retry" onPress={onRetry} variant="ghost" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  actions: {
    alignItems: "flex-start",
  },
});
