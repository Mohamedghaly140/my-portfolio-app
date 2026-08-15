import { View } from "react-native";
import { NativeTabs } from "expo-router/unstable-native-tabs";

import { ChatFab } from "@/components/chat-fab";

/**
 * Tab order: Home · Blogs · Experience · Contact · Settings. Chat moved to a
 * root modal (see `src/app/(chat)/`), reachable via the global `ChatFab`.
 * About, Projects, Project detail, Skills and Privacy push inside the Home
 * stack — they are never tabs.
 */
export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <NativeTabs>
        <NativeTabs.Trigger name="(home)">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "house", selected: "house.fill" }}
            md="home"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="(blog)">
          <NativeTabs.Trigger.Label>Blogs</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "newspaper", selected: "newspaper.fill" }}
            md="article"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="(experience)">
          <NativeTabs.Trigger.Label>Experience</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "briefcase", selected: "briefcase.fill" }}
            md="work"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="(contact)">
          <NativeTabs.Trigger.Label>Contact</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "envelope", selected: "envelope.fill" }}
            md="mail"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="(settings)">
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "gearshape", selected: "gearshape.fill" }}
            md="settings"
          />
        </NativeTabs.Trigger>
      </NativeTabs>
      <ChatFab />
    </View>
  );
}
