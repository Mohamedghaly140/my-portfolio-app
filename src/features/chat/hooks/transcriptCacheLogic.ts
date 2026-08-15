import type { ConversationSnapshot, ConversationSnapshotMessage } from "@/lib/api/conversations";

export const CACHE_VERSION = 1;
export const MAX_TRANSCRIPT_MESSAGES = 40;

export type CachedTranscript = {
  version: number;
  conversationId: string;
  snapshotVersion: string;
  messages: ConversationSnapshotMessage[];
  stoppedIds: string[];
};

export function validateCache(
  cached: CachedTranscript | null,
  snapshot: ConversationSnapshot,
): boolean {
  if (!cached) return false;
  return (
    cached.version === CACHE_VERSION &&
    cached.conversationId === snapshot.id &&
    cached.snapshotVersion === snapshot.version
  );
}

export function evictOverflow(
  messages: ConversationSnapshotMessage[],
): ConversationSnapshotMessage[] {
  if (messages.length <= MAX_TRANSCRIPT_MESSAGES) return messages;
  return messages.slice(messages.length - MAX_TRANSCRIPT_MESSAGES);
}
