import { Stack } from 'expo-router';

export default function BlogStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Blogs' }} />
    </Stack>
  );
}
