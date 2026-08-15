import { StyleSheet, View } from "react-native";

import { Badge, Text } from "@/components/ui";
import type { ContactHandoffBlock } from "@/features/chat/blocks";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/data/contact";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

export type ContactHandoffPlaceholderProps = {
  block: ContactHandoffBlock;
};

export function ContactHandoffPlaceholder({
  block,
}: ContactHandoffPlaceholderProps) {
  const { colors } = useTheme();
  // `block.status` is intentionally unused — interactive handoff is M6.
  void block;

  return (
    <View
      accessibilityLabel="Contact handoff coming soon"
      style={[
        styles.root,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Badge label="Coming soon" variant="muted" />
      <View style={styles.channels}>
        <ChannelRow label="Email" value={CONTACT_EMAIL} />
        <ChannelRow label="Phone" value={CONTACT_PHONE} />
        <ChannelRow label="WhatsApp" value={CONTACT_PHONE} />
      </View>
    </View>
  );
}

function ChannelRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.channel}>
      <Text color="textMuted" role="small">
        {label}
      </Text>
      <Text role="body">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  channels: {
    gap: Spacing.two,
  },
  channel: {
    gap: Spacing.half,
  },
});
