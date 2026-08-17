import { NativeTabs } from "expo-router/unstable-native-tabs";
import { View } from "react-native";

import { ChatFab } from "@/components/chat-fab";
import { selectionChanged } from "@/lib/haptics";

/**
 * Tab order: Home · Blogs · Experience · Contact · Settings. Chat moved to a
 * root modal (see `src/app/chat/`), reachable via the global `ChatFab`.
 * `chat` is a REAL path segment, not a `(group)` — a route group here would
 * resolve to bare "/" and collide with `(tabs)/(home)/index.tsx` for the
 * app's initial route, which is exactly the bug this comment is warning
 * against (cold launch opened straight into the chat modal, no tabs).
 * About, Projects, Project detail, Skills and Privacy push inside the Home
 * stack — they are never tabs.
 *
 * `(home)` stays a route group (deliberately transparent, mapping to bare
 * "/"); `blog`, `experience`, `contact` and `settings` are literal folders
 * so their tabs get real URL segments (`/blog`, `/experience`, `/contact`,
 * `/settings`) for deep linking — fixed 2026-08-16 after device testing
 * showed the group-wrapped versions had no reachable path and silently fell
 * through to `blog/[slug].tsx`'s dynamic segment instead.
 */
export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <NativeTabs screenListeners={{ tabPress: () => selectionChanged() }}>
        <NativeTabs.Trigger name="(home)">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "house", selected: "house.fill" }}
            md="home"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="blog">
          <NativeTabs.Trigger.Label>Blogs</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "newspaper", selected: "newspaper.fill" }}
            md="article"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="experience">
          <NativeTabs.Trigger.Label>Experience</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "briefcase", selected: "briefcase.fill" }}
            md="work"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="contact">
          <NativeTabs.Trigger.Label>Contact</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "envelope", selected: "envelope.fill" }}
            md="mail"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="settings">
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
