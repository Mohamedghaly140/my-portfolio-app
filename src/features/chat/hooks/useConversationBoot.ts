import { useCallback, useEffect, useState } from "react";
import {
  type ConversationSnapshot,
  createConversation,
  fetchLatestConversation,
} from "@/lib/api/conversations";
import {
  CACHE_VERSION,
  type CachedTranscript,
  validateCache,
} from "./transcriptCacheLogic";
import { useTranscriptCache, waitForTranscriptCache } from "./useTranscriptCache";

export type BootState =
  | { phase: "loading" }
  | { phase: "ready"; snapshot: ConversationSnapshot; degraded: false }
  | { phase: "degraded"; cached: CachedTranscript; degraded: true }
  | { phase: "failed" };

export function useConversationBoot(): BootState & { retry: () => void } {
  const { save } = useTranscriptCache();
  const [bootState, setBootState] = useState<BootState>({ phase: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run(): Promise<void> {
      setBootState({ phase: "loading" });
      const cached = await waitForTranscriptCache();

      try {
        let snapshot = await fetchLatestConversation();
        if (snapshot === null) {
          snapshot = await createConversation();
        }

        if (!validateCache(cached, snapshot)) {
          save({
            version: CACHE_VERSION,
            conversationId: snapshot.id,
            snapshotVersion: snapshot.version,
            messages: snapshot.messages,
            stoppedIds: [],
          });
        }

        if (!cancelled) {
          setBootState({ phase: "ready", snapshot, degraded: false });
        }
      } catch {
        if (cancelled) return;
        if (cached !== null) {
          setBootState({ phase: "degraded", cached, degraded: true });
        } else {
          setBootState({ phase: "failed" });
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [attempt, save]);

  const retry = useCallback((): void => {
    setAttempt((current) => current + 1);
  }, []);

  return { ...bootState, retry };
}
