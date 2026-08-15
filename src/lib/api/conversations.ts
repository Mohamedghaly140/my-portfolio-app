import { apiRequest } from "./client";
import type { ProjectGridBlock, SourceListBlock, LeadFormBlock, ContactHandoffBlock } from "@/features/chat/blocks";

export type ConversationMessageStatus =
  | "PENDING" | "STREAMING" | "COMPLETED" | "FAILED" | "CANCELLED" | "BLOCKED";

export type ConversationSnapshotPart =
  | { type: "text"; text: string }
  | { type: "data-projectGrid"; data: ProjectGridBlock }
  | { type: "data-sourceList"; data: SourceListBlock }
  | { type: "data-leadForm"; data: LeadFormBlock }
  | { type: "data-contactHandoff"; data: ContactHandoffBlock };

export type ConversationSnapshotMessage = {
  id: string;
  role: "user" | "assistant";
  status: ConversationMessageStatus;
  parts: ConversationSnapshotPart[];
  createdAt: string;
  completedAt: string | null;
};

export type ConversationSnapshot = {
  id: string;
  version: string;
  status: "ACTIVE";
  messages: ConversationSnapshotMessage[];
  hasActiveGeneration: boolean;
  createdAt: string;
  updatedAt: string;
};

async function parseConversation(response: Response): Promise<ConversationSnapshot> {
  const body = (await response.json()) as { conversation: ConversationSnapshot };
  return body.conversation;
}

export async function fetchLatestConversation(): Promise<ConversationSnapshot | null> {
  const response = await apiRequest("/api/conversations");
  const body = (await response.json()) as { conversation: ConversationSnapshot | null };
  return body.conversation;
}

export async function createConversation(): Promise<ConversationSnapshot> {
  const response = await apiRequest("/api/conversations", { method: "POST", body: "{}" });
  return parseConversation(response);
}

export async function fetchConversation(id: string): Promise<ConversationSnapshot> {
  const response = await apiRequest(`/api/conversations/${encodeURIComponent(id)}`);
  return parseConversation(response);
}

export async function cancelConversation(id: string): Promise<void> {
  await apiRequest(`/api/conversations/${encodeURIComponent(id)}/cancel`, { method: "POST", body: "{}" });
}

export async function deleteConversation(id: string): Promise<void> {
  await apiRequest(`/api/conversations/${encodeURIComponent(id)}`, { method: "DELETE" });
}
