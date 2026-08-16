import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Text } from "@/components/ui";
import type { StreamPhase } from "@/features/chat/hooks/streamPhase";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

export type StreamStatusProps = {
  phase: StreamPhase;
  activeToolLabel?: string | null;
};

const PHASE_LABELS: Partial<Record<StreamPhase, string>> = {
  submitted: "Connecting…",
  connecting: "Connecting…",
  retrieving: "Retrieving…",
  streaming: "Mo Ghaly GPT is typing…",
  stopped: "Stopped",
};

export function StreamStatus({ phase, activeToolLabel }: StreamStatusProps) {
  const { colors } = useTheme();

  const label =
    phase === "retrieving"
      ? (activeToolLabel ?? PHASE_LABELS.retrieving)
      : PHASE_LABELS[phase];

  if (!label) return null;

  const showSpinner =
    phase === "submitted" ||
    phase === "connecting" ||
    phase === "streaming" ||
    phase === "retrieving";

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.root}
    >
      {showSpinner ? (
        <ActivityIndicator color={colors.accentText} size="small" />
      ) : null}
      <Text color="textMuted" role="small">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.two,
    minHeight: 24,
    paddingHorizontal: Spacing.gutter,
  },
});
