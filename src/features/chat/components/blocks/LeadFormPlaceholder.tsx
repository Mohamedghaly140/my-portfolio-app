import { StyleSheet, View } from "react-native";

import { Badge, Text } from "@/components/ui";
import type { LeadFormBlock } from "@/features/chat/blocks";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

export type LeadFormPlaceholderProps = {
  block: LeadFormBlock;
};

const FALLBACK_SUMMARY = "Mohamed will need a few more details";

export function LeadFormPlaceholder({ block }: LeadFormPlaceholderProps) {
  const { colors } = useTheme();
  const summary = block.draft.summary?.trim() || FALLBACK_SUMMARY;

  return (
    <View
      accessibilityLabel="Lead form coming soon"
      style={[
        styles.root,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Badge label="Coming soon" variant="muted" />
      <Text color="textMuted" role="body">
        {summary}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
});
