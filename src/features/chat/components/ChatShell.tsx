import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { Button, Text } from "@/components/ui";
import { useChatSession } from "@/features/chat/hooks/useChatSession";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

import { Composer } from "./Composer";
import { ErrorNotice } from "./ErrorNotice";
import { LiveAnnouncer } from "./LiveAnnouncer";
import { MessageList } from "./MessageList";
import { StreamStatus } from "./StreamStatus";
import { WelcomeState } from "./WelcomeState";

type ChatSession = ReturnType<typeof useChatSession>;

type ChatShellProps = {
  session: ChatSession;
};

export function ChatShell({ session }: ChatShellProps) {
  const { colors } = useTheme();
  const {
    messages,
    phase,
    error,
    draftText,
    setDraftText,
    sendMessage,
    stop,
    retry,
    bootState,
  } = session;

  const [degradedBannerDismissed, setDegradedBannerDismissed] = useState(false);

  const bootPhase = bootState.phase;
  const showWelcome =
    messages.length === 0 &&
    phase !== "submitted" &&
    phase !== "connecting";
  const composerDisabled = bootPhase !== "ready";
  const showDegradedBanner =
    bootPhase === "degraded" && !degradedBannerDismissed;

  if (bootPhase === "loading") {
    return (
      <View
        style={[styles.centered, { backgroundColor: colors.bg }]}
      >
        <ActivityIndicator color={colors.accentText} size="large" />
        <Text color="textMuted" role="small">
          Loading conversation…
        </Text>
      </View>
    );
  }

  if (bootPhase === "failed") {
    return (
      <View
        style={[styles.centered, { backgroundColor: colors.bg }]}
      >
        <Text role="body" style={styles.failedCopy}>
          {"Couldn't load this conversation. Check your connection and try again."}
        </Text>
        <Button label="Retry" onPress={retry} variant="primary" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      style={[styles.root, { backgroundColor: colors.bg }]}
    >
      <LiveAnnouncer errorMessage={error?.message} phase={phase} />

      {showDegradedBanner ? (
        <View
          style={[
            styles.banner,
            { backgroundColor: colors.surface, borderBottomColor: colors.border },
          ]}
        >
          <Text color="textMuted" role="small" style={styles.bannerText}>
            {"You're viewing a cached version of this conversation."}
          </Text>
          <Pressable
            accessibilityLabel="Dismiss cached conversation banner"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setDegradedBannerDismissed(true)}
          >
            <Text color="accentText" role="small">
              Dismiss
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.body}>
        {showWelcome ? (
          <WelcomeState onSelectPrompt={setDraftText} />
        ) : (
          <MessageList messages={messages} />
        )}
      </View>

      <View style={styles.footer}>
        {error ? <ErrorNotice error={error} onRetry={retry} /> : null}
        <StreamStatus phase={phase} />
        <Composer
          disabled={composerDisabled}
          draftText={draftText}
          onSend={sendMessage}
          onStop={stop}
          phase={phase}
          setDraftText={setDraftText}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  footer: {
    gap: Spacing.two,
  },
  centered: {
    alignItems: "center",
    flex: 1,
    gap: Spacing.three,
    justifyContent: "center",
    paddingHorizontal: Spacing.gutter,
  },
  failedCopy: {
    textAlign: "center",
  },
  banner: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: Spacing.two,
    justifyContent: "space-between",
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.two,
  },
  bannerText: {
    flex: 1,
  },
});
