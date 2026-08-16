import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { ChannelList } from "@/components/channel-list";
import { Card, Text } from "@/components/ui";
import { CONTACT_CHANNELS } from "@/data/contact-channels";
import type { ContactHandoffBlock } from "@/features/chat/blocks";
import { selectionChanged } from "@/lib/haptics";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

export type ContactHandoffProps = {
  block: ContactHandoffBlock;
};

function ContactPageRow() {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityLabel="Open the Contact tab"
      accessibilityRole="button"
      onPress={() => {
        selectionChanged();
        router.push("/(tabs)/contact");
      }}
      style={styles.contactPageRow}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Ionicons
          color={colors.accentText}
          name="create-outline"
          size={18}
          style={styles.contactPageIcon}
        />
      </View>
      <View style={styles.contactPageCopy}>
        <Text color="textMuted" role="small">
          Contact page
        </Text>
        <Text color="accentText" role="body">
          Open the Contact tab
        </Text>
      </View>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Ionicons color={colors.accentText} name="chevron-forward" size={16} />
      </View>
    </Pressable>
  );
}

function ChannelSection({ heading }: { heading: string }) {
  return (
    <View style={styles.channelSection}>
      <ChannelList heading={heading} items={CONTACT_CHANNELS} />
      <Card style={styles.contactPageCard}>
        <ContactPageRow />
      </Card>
    </View>
  );
}

export function ContactHandoff({ block }: ContactHandoffProps) {
  const { colors } = useTheme();

  if (block.status === "submitted") {
    return (
      <Card style={styles.submittedCard}>
        <Text role="body">
          Your message was sent to Mohamed.
          {block.leadReference ? (
            <>
              {" "}
              Reference{" "}
              <Text color="code" role="code">
                {block.leadReference}
              </Text>
              .
            </>
          ) : null}
        </Text>
      </Card>
    );
  }

  if (block.status === "failed") {
    return (
      <View style={styles.failedRoot}>
        <View
          style={[
            styles.failedNotice,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text color="textMuted" role="small">
            {
              "That message couldn't be sent. You can reach Mohamed directly:"
            }
          </Text>
        </View>
        <ChannelSection heading="Direct channels" />
      </View>
    );
  }

  return <ChannelSection heading="Reach Mohamed" />;
}

const styles = StyleSheet.create({
  channelSection: {
    gap: Spacing.two,
  },
  contactPageCard: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  contactPageRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.two,
    minHeight: 44,
  },
  contactPageIcon: {
    marginTop: 2,
  },
  contactPageCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  submittedCard: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  failedRoot: {
    gap: Spacing.two,
  },
  failedNotice: {
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
