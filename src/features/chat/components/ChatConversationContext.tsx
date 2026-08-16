import { createContext, use, type ReactNode } from "react";

const ChatConversationContext = createContext<string | null>(null);

export function ChatConversationProvider({
  conversationId,
  children,
}: {
  conversationId: string;
  children: ReactNode;
}) {
  return (
    <ChatConversationContext value={conversationId}>
      {children}
    </ChatConversationContext>
  );
}

export function useChatConversationId(): string {
  const conversationId = use(ChatConversationContext);
  if (!conversationId) {
    throw new Error("Lead forms require a chat conversation provider.");
  }
  return conversationId;
}
