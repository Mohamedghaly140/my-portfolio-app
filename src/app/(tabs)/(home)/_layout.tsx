import { Stack } from 'expo-router';

/**
 * About, Projects, Project detail, Skills and Privacy push onto this stack
 * (M3). They are deliberately not tabs.
 */
export default function HomeStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="gallery" options={{ title: 'Token gallery' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
      <Stack.Screen name="skills" options={{ title: 'Skills' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy' }} />
      <Stack.Screen name="projects/index" options={{ title: 'Projects' }} />
      <Stack.Screen name="projects/[slug]" options={{ title: 'Project' }} />
    </Stack>
  );
}
