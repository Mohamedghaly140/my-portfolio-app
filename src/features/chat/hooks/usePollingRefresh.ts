import { useEffect } from "react";
import { AppState } from "react-native";
import {
  type ConversationSnapshot,
  fetchConversation,
} from "@/lib/api/conversations";
import { shouldPoll } from "./pollGate";

const POLL_INTERVAL_MS = 1500;

export function usePollingRefresh(args: {
  conversationId: string;
  hasActiveGeneration: boolean;
  localStreamActive: boolean;
  onRefresh: (snapshot: ConversationSnapshot) => void;
}): void {
  const { conversationId, hasActiveGeneration, localStreamActive, onRefresh } = args;

  useEffect(() => {
    if (!conversationId) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const clear = (): void => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const sync = (): void => {
      const poll = shouldPoll({
        hasActiveGeneration,
        localStreamActive,
        appState: AppState.currentState,
      });

      if (poll) {
        if (intervalId === null) {
          intervalId = setInterval(() => {
            void fetchConversation(conversationId)
              .then(onRefresh)
              .catch(() => {
                // Keep the in-memory transcript; the next tick or boot revalidates.
              });
          }, POLL_INTERVAL_MS);
        }
      } else {
        clear();
      }
    };

    sync();
    const subscription = AppState.addEventListener("change", sync);

    return () => {
      subscription.remove();
      clear();
    };
  }, [conversationId, hasActiveGeneration, localStreamActive, onRefresh]);
}
