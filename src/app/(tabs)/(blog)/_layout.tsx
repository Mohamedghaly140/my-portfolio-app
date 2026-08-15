import { Stack } from 'expo-router';

import { FontFamilies } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export default function BlogStackLayout() {
  const { colors, scheme } = useTheme();
  const isIOS = process.env.EXPO_OS === 'ios';

  const shared = {
    headerShadowVisible: false,
    headerTintColor: colors.accentText,
    headerTitleStyle: { fontFamily: FontFamilies.displayBold },
  } as const;

  const indexOptions = isIOS
    ? {
        ...shared,
        title: 'Blogs',
        headerLargeTitle: true,
        headerTransparent: true,
        headerBlurEffect:
          scheme === 'dark' ? ('systemMaterialDark' as const) : ('systemMaterialLight' as const),
        headerLargeTitleStyle: { fontFamily: FontFamilies.displayBold },
      }
    : {
        ...shared,
        title: 'Blogs',
        headerStyle: { backgroundColor: colors.bg },
      };

  return (
    <Stack>
      <Stack.Screen name="index" options={indexOptions} />
    </Stack>
  );
}
