import { Stack } from 'expo-router';

export default function ContactStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Contact' }} />
    </Stack>
  );
}
