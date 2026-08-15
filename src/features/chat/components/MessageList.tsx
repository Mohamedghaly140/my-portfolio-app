import { FlatList, StyleSheet } from "react-native";

import type { ChatUIMessage } from "@/lib/api/chatTransport";
import { Spacing } from "@/theme";

import { MessageItem } from "./MessageItem";

export type MessageListProps = {
  messages: ChatUIMessage[];
};

export function MessageList({ messages }: MessageListProps) {
  const data = [...messages].reverse();

  return (
    <FlatList
      accessibilityLabel="Conversation with Mo Ghaly GPT"
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      data={data}
      inverted
      keyExtractor={(item) => item.id}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => <MessageItem message={item} />}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingVertical: Spacing.two,
  },
});
