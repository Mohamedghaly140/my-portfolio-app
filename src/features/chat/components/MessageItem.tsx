import { StyleSheet, View } from "react-native";

import { Text } from "@/components/ui";
import {
  chatBlocksFromParts,
  type RenderableChatBlock,
} from "@/features/chat/blocks";
import type { ChatUIMessage } from "@/lib/api/chatTransport";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

import { ContactHandoffPlaceholder } from "./blocks/ContactHandoffPlaceholder";
import { LeadFormPlaceholder } from "./blocks/LeadFormPlaceholder";
import { ProjectGrid } from "./blocks/ProjectGrid";
import { SourceList } from "./blocks/SourceList";
import { UnknownBlock } from "./blocks/UnknownBlock";

export type MessageItemProps = {
  message: ChatUIMessage;
};

function messageText(message: ChatUIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

function BlockRenderer({ entry }: { entry: RenderableChatBlock }) {
  if (entry.kind === "unknown") {
    return <UnknownBlock />;
  }

  switch (entry.block.type) {
    case "project_grid":
      return <ProjectGrid block={entry.block} />;
    case "source_list":
      return <SourceList block={entry.block} />;
    case "lead_form":
      return <LeadFormPlaceholder block={entry.block} />;
    case "contact_handoff":
      return <ContactHandoffPlaceholder block={entry.block} />;
  }
}

export function MessageItem({ message }: MessageItemProps) {
  const { colors } = useTheme();
  const text = messageText(message);
  const blocks = chatBlocksFromParts(message.parts);

  if (message.role === "user") {
    return (
      <View
        accessibilityLabel="You said"
        style={styles.userRoot}
      >
        <Text color="textMuted" role="small">
          You
        </Text>
        <View
          style={[
            styles.userBubble,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text role="body">{text}</Text>
        </View>
      </View>
    );
  }

  if (message.role !== "assistant") return null;

  return (
    <View accessibilityLabel="Mo Ghaly GPT said" style={styles.assistantRoot}>
      <Text color="accentText" role="small">
        Mo Ghaly GPT
      </Text>
      <View
        style={[
          styles.assistantBody,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {text.length > 0 ? <Text role="body">{text}</Text> : null}
        {blocks.map((entry, index) => (
          <BlockRenderer
            entry={entry}
            key={`${message.id}-block-${index}`}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userRoot: {
    alignItems: "flex-end",
    gap: Spacing.one,
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.two,
  },
  userBubble: {
    borderWidth: 1,
    maxWidth: "85%",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - Spacing.half,
  },
  assistantRoot: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.two,
  },
  assistantBody: {
    borderWidth: 1,
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - Spacing.half,
  },
});
