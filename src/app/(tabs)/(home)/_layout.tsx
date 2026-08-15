import { Stack } from 'expo-router';

import { FontFamilies } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

/**
 * About, Projects, Project detail, Skills and Privacy push onto this stack
 * (M3). They are deliberately not tabs.
 */
export default function HomeStackLayout() {
  const { colors, scheme } = useTheme();
  const isIOS = process.env.EXPO_OS === 'ios';

  const shared = {
    headerShadowVisible: false,
    headerTintColor: colors.accentText,
    headerTitleStyle: { fontFamily: FontFamilies.displayBold },
  } as const;

  const pushed = {
    ...shared,
    headerStyle: { backgroundColor: colors.bg },
  } as const;

  const indexOptions = isIOS
    ? {
        ...shared,
        title: 'Home',
        headerLargeTitle: true,
        headerTransparent: true,
        headerBlurEffect:
          scheme === 'dark' ? ('systemMaterialDark' as const) : ('systemMaterialLight' as const),
        headerLargeTitleStyle: { fontFamily: FontFamilies.displayBold },
      }
    : {
        ...pushed,
        title: 'Home',
      };

  return (
    <Stack screenOptions={pushed}>
      <Stack.Screen name="index" options={indexOptions} />
      <Stack.Screen name="gallery" options={{ title: 'Token gallery' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
      <Stack.Screen name="skills" options={{ title: 'Skills' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy' }} />
      <Stack.Screen name="projects/index" options={{ title: 'Projects' }} />
      <Stack.Screen name="projects/[slug]" options={{ title: 'Project' }} />
    </Stack>
  );
}
