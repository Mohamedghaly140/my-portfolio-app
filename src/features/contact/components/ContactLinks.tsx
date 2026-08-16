import { StyleSheet, View } from "react-native";

import {
  ChannelList,
  type ContactChannelItem,
} from "@/components/channel-list";
import { CONTACT_CHANNELS } from "@/data/contact-channels";
import { SocialLinks } from "@/features/home/components/social-links";
import { Spacing } from "@/theme";

const STATIC_CHANNELS: ContactChannelItem[] = [
  {
    id: "location",
    label: "Location",
    value: "Egypt — Available Remotely",
    icon: "location-outline",
  },
  {
    id: "status",
    label: "Status",
    value: "Open to opportunities",
    icon: "checkmark-circle-outline",
  },
];

const CONTACT_LINK_ITEMS: ContactChannelItem[] = [
  ...CONTACT_CHANNELS,
  ...STATIC_CHANNELS,
];

export function ContactLinks() {
  return (
    <View style={styles.root}>
      <ChannelList items={CONTACT_LINK_ITEMS} />
      <SocialLinks />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.four,
    marginBottom: Spacing.three,
  },
});
