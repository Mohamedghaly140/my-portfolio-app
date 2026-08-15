import { NativeTabs } from 'expo-router/unstable-native-tabs';

/**
 * Tab order is fixed: Home · Blogs · Chat · Experience · Contact (D1).
 * About, Projects, Project detail, Skills and Privacy push inside the Home
 * stack — they are never tabs.
 */
export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(blog)">
        <NativeTabs.Trigger.Label>Blogs</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'doc.text', selected: 'doc.text.fill' }}
          md="article"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(chat)">
        <NativeTabs.Trigger.Label>Chat</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'bubble.left.and.bubble.right', selected: 'bubble.left.and.bubble.right.fill' }}
          md="forum"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(experience)">
        <NativeTabs.Trigger.Label>Experience</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'briefcase', selected: 'briefcase.fill' }}
          md="work"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(contact)">
        <NativeTabs.Trigger.Label>Contact</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'envelope', selected: 'envelope.fill' }}
          md="mail"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
