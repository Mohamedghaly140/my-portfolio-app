import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { ChatOnDataCallback, ChatOnFinishCallback } from "ai";
import {
  chatBlocksFromParts,
  parseToolStatusPart,
  type RenderableChatBlock,
} from "@/features/chat/blocks";
import {
  cancelConversation,
  createConversation,
  deleteConversation,
  type ConversationSnapshot,
  type ConversationSnapshotMessage,
  type ConversationSnapshotPart,
} from "@/lib/api/conversations";
import { createChatTransport, type ChatUIMessage } from "@/lib/api/chatTransport";
import { CHAT_ERRORS, parseChatError } from "@/lib/api/errors";
import { type BootState, useConversationBoot } from "./useConversationBoot";
import { deriveStreamPhase, type StreamPhase } from "./streamPhase";
import { CACHE_VERSION } from "./transcriptCacheLogic";
import { usePollingRefresh } from "./usePollingRefresh";
import { useTranscriptCache } from "./useTranscriptCache";

type SessionError = { code: string; message: string; retryable: boolean };

function hydrateMessages(messages: ConversationSnapshotMessage[]): ChatUIMessage[] {
  return messages.flatMap((message) => {
    if (message.role !== "user" && message.role !== "assistant") return [];
    return [
      {
        id: message.id,
        role: message.role,
        parts: message.parts as ChatUIMessage["parts"],
      } satisfies ChatUIMessage,
    ];
  });
}

function toCachedMessages(
  messages: ChatUIMessage[],
  stoppedIds: Set<string>,
): ConversationSnapshotMessage[] {
  return messages.flatMap((message) => {
    if (message.role !== "user" && message.role !== "assistant") return [];
    return [
      {
        id: message.id,
        role: message.role,
        status: stoppedIds.has(message.id) ? "CANCELLED" : "COMPLETED",
        parts: message.parts as ConversationSnapshotPart[],
        createdAt: new Date().toISOString(),
        completedAt: null,
      } satisfies ConversationSnapshotMessage,
    ];
  });
}

function errorFromSnapshot(snapshot: ConversationSnapshot): SessionError | null {
  const latest = snapshot.messages.at(-1);
  if (latest?.role !== "assistant") return null;
  if (latest.status === "BLOCKED") {
    return { code: "MESSAGE_BLOCKED", ...CHAT_ERRORS.MESSAGE_BLOCKED };
  }
  if (latest.status === "FAILED") {
    return { code: "RETRY_REQUIRED", ...CHAT_ERRORS.RETRY_REQUIRED };
  }
  return null;
}

function discardRejectedUserTurn(messages: ChatUIMessage[]): ChatUIMessage[] {
  const latest = messages.at(-1);
  if (latest?.role !== "user") return messages;
  return messages.slice(0, -1);
}

export function useChatSession(): {
  messages: ChatUIMessage[];
  blocks: RenderableChatBlock[];
  phase: StreamPhase;
  error: SessionError | null;
  draftText: string;
  setDraftText: (text: string) => void;
  sendMessage: (text: string) => void;
  stop: () => void;
  retry: () => void;
  newChat: () => void;
  isStartingNewChat: boolean;
  bootState: BootState;
  conversationId: string;
} {
  const boot = useConversationBoot();
  const { retry: retryBoot, ...bootState } = boot;
  const { save } = useTranscriptCache();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [snapshotVersion, setSnapshotVersion] = useState("");
  const [hasActiveGeneration, setHasActiveGeneration] = useState(false);
  const [connected, setConnected] = useState(false);
  const [activeToolLabel, setActiveToolLabel] = useState<string | null>(null);
  const [stoppedIds, setStoppedIds] = useState(() => new Set<string>());
  const [lastError, setLastError] = useState<SessionError | null>(null);
  const [isStartingNewChat, setIsStartingNewChat] = useState(false);
  const [draftText, setDraftText] = useState("");

  const lastSubmittedTextRef = useRef<string | null>(null);
  const pendingHydrationRef = useRef<ChatUIMessage[] | null>(null);
  const hydratedBootKeyRef = useRef<string | null>(null);
  const rejectedTurnHandlerRef = useRef<(error: Error) => void>(() => {});

  const onResponse = useCallback((_response: Response): void => {
    setConnected(true);
  }, []);

  const transport = useMemo(
    () =>
      createChatTransport({
        conversationId: conversationId ?? "boot-pending",
        onResponse,
      }),
    [conversationId, onResponse],
  );

  const handleData = useCallback<ChatOnDataCallback<ChatUIMessage>>((part) => {
    const status = parseToolStatusPart(part);
    if (status) setActiveToolLabel(status.activeLabel);
  }, []);

  const handleFinish = useCallback<ChatOnFinishCallback<ChatUIMessage>>(
    ({ message, messages: finishedMessages, isAbort }) => {
      setConnected(false);
      setActiveToolLabel(null);
      setHasActiveGeneration(false);
      lastSubmittedTextRef.current = null;
      if (!isAbort) return;

      setStoppedIds((current) => {
        const next = new Set(current);
        if (message.parts.length > 0) {
          next.add(message.id);
        } else {
          const userMessage = [...finishedMessages]
            .reverse()
            .find((candidate) => candidate.role === "user");
          if (userMessage) next.add(userMessage.id);
        }
        return next;
      });
    },
    [],
  );

  const handleChatError = useCallback((error: Error): void => {
    setConnected(false);
    setActiveToolLabel(null);
    setHasActiveGeneration(false);
    const parsed = parseChatError(error);
    setLastError(parsed);
    rejectedTurnHandlerRef.current(error);
  }, []);

  const {
    messages,
    setMessages,
    sendMessage: chatSendMessage,
    regenerate,
    stop: chatStop,
    status,
    clearError,
  } = useChat<ChatUIMessage>({
    id: conversationId ?? "boot-pending",
    messages: [],
    transport,
    throttle: 50,
    onData: handleData,
    onFinish: handleFinish,
    onError: handleChatError,
  });

  useEffect(() => {
    if (bootState.phase === "ready") {
      const key = `ready:${bootState.snapshot.id}:${bootState.snapshot.version}`;
      if (hydratedBootKeyRef.current === key) return;
      hydratedBootKeyRef.current = key;
      pendingHydrationRef.current = hydrateMessages(bootState.snapshot.messages);
      setConversationId(bootState.snapshot.id);
      setSnapshotVersion(bootState.snapshot.version);
      setHasActiveGeneration(bootState.snapshot.hasActiveGeneration);
      setStoppedIds(
        new Set(
          bootState.snapshot.messages
            .filter((message) => message.status === "CANCELLED")
            .map((message) => message.id),
        ),
      );
      setLastError(errorFromSnapshot(bootState.snapshot));
      setConnected(false);
      setActiveToolLabel(null);
      return;
    }

    if (bootState.phase === "degraded") {
      const key = `degraded:${bootState.cached.conversationId}:${bootState.cached.snapshotVersion}`;
      if (hydratedBootKeyRef.current === key) return;
      hydratedBootKeyRef.current = key;
      pendingHydrationRef.current = hydrateMessages(bootState.cached.messages);
      setConversationId(bootState.cached.conversationId);
      setSnapshotVersion(bootState.cached.snapshotVersion);
      setHasActiveGeneration(false);
      setStoppedIds(new Set(bootState.cached.stoppedIds));
      setLastError({ code: "NETWORK", ...CHAT_ERRORS.NETWORK });
      setConnected(false);
      setActiveToolLabel(null);
    }
  }, [bootState]);

  useEffect(() => {
    if (!conversationId || pendingHydrationRef.current === null) return;
    setMessages(pendingHydrationRef.current);
    pendingHydrationRef.current = null;
  }, [conversationId, setMessages]);

  useEffect(() => {
    rejectedTurnHandlerRef.current = (chatError: Error): void => {
      const rejected = parseChatError(chatError);
      if (rejected.code !== "MESSAGE_BLOCKED" && rejected.code !== "SECRET_IN_MESSAGE") {
        return;
      }
      setMessages((current) => discardRejectedUserTurn(current));
      const submittedText = lastSubmittedTextRef.current;
      if (submittedText) {
        setDraftText((current) => current || submittedText);
      }
    };
  }, [setMessages]);

  const onRefresh = useCallback(
    (snapshot: ConversationSnapshot): void => {
      setSnapshotVersion(snapshot.version);
      setHasActiveGeneration(snapshot.hasActiveGeneration);
      setStoppedIds(
        new Set(
          snapshot.messages
            .filter((message) => message.status === "CANCELLED")
            .map((message) => message.id),
        ),
      );
      setLastError(errorFromSnapshot(snapshot));
      setMessages(hydrateMessages(snapshot.messages));
    },
    [setMessages],
  );

  usePollingRefresh({
    conversationId: conversationId ?? "",
    hasActiveGeneration,
    localStreamActive: status === "submitted" || status === "streaming",
    onRefresh,
  });

  useEffect(() => {
    if (!conversationId || bootState.phase === "loading" || bootState.phase === "failed") {
      return;
    }
    save({
      version: CACHE_VERSION,
      conversationId,
      snapshotVersion,
      messages: toCachedMessages(messages, stoppedIds),
      stoppedIds: [...stoppedIds],
    });
  }, [bootState.phase, conversationId, messages, save, snapshotVersion, stoppedIds]);

  const blocks: RenderableChatBlock[] = useMemo(() => {
    const trailingAssistant = [...messages]
      .reverse()
      .find((message) => message.role === "assistant");
    return trailingAssistant ? chatBlocksFromParts(trailingAssistant.parts) : [];
  }, [messages]);

  const lastMessage = messages.at(-1);
  const lastTurnStopped =
    lastMessage !== undefined && stoppedIds.has(lastMessage.id);
  const phase = deriveStreamPhase({
    status,
    connected,
    activeToolLabel,
    lastTurnStopped,
    hasError: lastError !== null,
  });

  const sendMessage = useCallback(
    (text: string): void => {
      const trimmed = text.trim();
      if (!trimmed || !conversationId) return;
      if (status === "submitted" || status === "streaming") return;
      if (bootState.phase === "degraded" || bootState.phase === "failed") return;

      setConnected(false);
      setActiveToolLabel(null);
      setLastError(null);
      clearError();
      setHasActiveGeneration(true);
      lastSubmittedTextRef.current = trimmed;
      void chatSendMessage({ text: trimmed });
    },
    [bootState.phase, chatSendMessage, clearError, conversationId, status],
  );

  const stop = useCallback((): void => {
    void chatStop();
    if (!conversationId) return;
    void cancelConversation(conversationId).catch(() => {
      // Local abort remains the primary UI signal; cancel is best-effort.
    });
  }, [chatStop, conversationId]);

  const retry = useCallback((): void => {
    if (bootState.phase === "failed") {
      retryBoot();
      return;
    }
    clearError();
    setLastError(null);
    setConnected(false);
    setActiveToolLabel(null);
    setHasActiveGeneration(true);
    setStoppedIds((current) => {
      const next = new Set(current);
      const last = messages.at(-1);
      if (last) next.delete(last.id);
      return next;
    });
    const assistant = [...messages].reverse().find((message) => message.role === "assistant");
    if (assistant) {
      void regenerate({ messageId: assistant.id });
    }
  }, [bootState.phase, clearError, messages, regenerate, retryBoot]);

  const newChat = useCallback((): void => {
    if (isStartingNewChat) return;
    setIsStartingNewChat(true);
    void (async () => {
      try {
        const currentId = conversationId;
        if (currentId) {
          try {
            await deleteConversation(currentId);
          } catch {
            // Ignore failure/409 — still create a fresh conversation.
          }
        }

        try {
          const snapshot = await createConversation();
          hydratedBootKeyRef.current = `ready:${snapshot.id}:${snapshot.version}`;
          pendingHydrationRef.current = [];
          setConversationId(snapshot.id);
          setSnapshotVersion(snapshot.version);
          setHasActiveGeneration(false);
          setStoppedIds(new Set());
          setLastError(null);
          setConnected(false);
          setActiveToolLabel(null);
          setDraftText("");
          lastSubmittedTextRef.current = null;
          clearError();
          save({
            version: CACHE_VERSION,
            conversationId: snapshot.id,
            snapshotVersion: snapshot.version,
            messages: [],
            stoppedIds: [],
          });
        } catch {
          // Leave the current session intact if create fails.
        }
      } finally {
        setIsStartingNewChat(false);
      }
    })();
  }, [clearError, conversationId, isStartingNewChat, save]);

  return {
    messages,
    blocks,
    phase,
    error: lastError,
    draftText,
    setDraftText,
    sendMessage,
    stop,
    retry,
    newChat,
    isStartingNewChat,
    bootState,
    conversationId: conversationId ?? "",
  };
}
