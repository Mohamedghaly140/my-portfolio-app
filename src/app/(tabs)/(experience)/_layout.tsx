import { Stack } from 'expo-router';

export default function ExperienceStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Experience' }} />
    </Stack>
  );
}
