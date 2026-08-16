import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";

import { Text } from "@/components/ui";
import type { StreamPhase } from "@/features/chat/hooks/streamPhase";
import { COMPOSER_NOTICE, MESSAGE_MAX_LENGTH } from "@/features/chat/lib/config";
import { lightImpact } from "@/lib/haptics";
import { Typography, Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

export type ComposerProps = {
  draftText: string;
  setDraftText: (text: string) => void;
  onSend: (text: string) => void;
  onStop: () => void;
  phase: StreamPhase;
  disabled: boolean;
};

function truncateToCodepoints(text: string, max: number): string {
  const normalized = text.normalize("NFC");
  const chars = Array.from(normalized);
  if (chars.length <= max) return normalized;
  return chars.slice(0, max).join("");
}

function isBusyPhase(phase: StreamPhase): boolean {
  return (
    phase === "streaming" ||
    phase === "connecting" ||
    phase === "submitted" ||
    phase === "retrieving"
  );
}

export function Composer({
  draftText,
  setDraftText,
  onSend,
  onStop,
  phase,
  disabled,
}: ComposerProps) {
  const { colors } = useTheme();
  const busy = isBusyPhase(phase);
  const trimmed = draftText.trim();
  const showCounter = Array.from(draftText.normalize("NFC")).length > MESSAGE_MAX_LENGTH * 0.9;

  function handleChange(next: string) {
    setDraftText(truncateToCodepoints(next, MESSAGE_MAX_LENGTH));
  }

  function handleSend() {
    if (disabled || busy || trimmed.length === 0) return;
    onSend(trimmed);
    setDraftText("");
  }

  function handleAction() {
    if (busy) {
      onStop();
      return;
    }
    lightImpact();
    handleSend();
  }

  const actionDisabled = disabled || (!busy && trimmed.length === 0);

  return (
    <View
      accessibilityLabel="Message composer"
      style={[styles.root, { backgroundColor: colors.bg, borderTopColor: colors.border }]}
    >
      <View style={styles.row}>
        <TextInput
          accessibilityLabel="Message Mo Ghaly GPT"
          editable={!disabled && !busy}
          multiline
          onChangeText={handleChange}
          placeholder="Ask about Mohamed's work"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={draftText}
        />
        <Pressable
          accessibilityLabel={busy ? "Stop" : "Send"}
          accessibilityRole="button"
          disabled={actionDisabled}
          hitSlop={8}
          onPress={handleAction}
          style={[
            styles.action,
            {
              backgroundColor: colors.accent,
              opacity: actionDisabled ? 0.5 : 1,
            },
          ]}
        >
          <Ionicons
            color={colors.onAccent}
            name={busy ? "stop" : "send"}
            size={18}
          />
        </Pressable>
      </View>

      <View style={styles.meta}>
        <Text color="textMuted" role="small" style={styles.notice}>
          {COMPOSER_NOTICE}
        </Text>
        {showCounter ? (
          <Text color="textMuted" role="small">
            {Array.from(draftText.normalize("NFC")).length}/{MESSAGE_MAX_LENGTH}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.two,
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  row: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    flex: 1,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    maxHeight: 128,
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === "ios" ? Spacing.two + Spacing.half : Spacing.two,
    textAlignVertical: "top",
  },
  action: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  meta: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: Spacing.two,
    justifyContent: "space-between",
  },
  notice: {
    flex: 1,
  },
});
