import { isLiquidGlassAvailable } from 'expo-glass-effect';
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

  const pushed = {
    ...shared,
    headerStyle: { backgroundColor: colors.bg },
  } as const;

  // iOS 26 Liquid Glass has a UIKit bug where a blurred transparent header with
  // headerLargeTitle renders blank until a scroll forces a relayout — dropping
  // the blur there is react-native-screens' confirmed workaround.
  // https://github.com/software-mansion/react-native-screens/issues/3100
  const headerBlurEffect =
    isIOS && !isLiquidGlassAvailable()
      ? scheme === 'dark'
        ? ('systemMaterialDark' as const)
        : ('systemMaterialLight' as const)
      : undefined;

  const indexOptions = isIOS
    ? {
        ...shared,
        title: 'Blogs',
        headerLargeTitle: true,
        headerTransparent: true,
        headerBlurEffect,
        headerLargeTitleStyle: { fontFamily: FontFamilies.displayBold },
      }
    : {
        ...pushed,
        title: 'Blogs',
      };

  return (
    <Stack screenOptions={pushed}>
      <Stack.Screen name="index" options={indexOptions} />
      <Stack.Screen name="[slug]" options={{ title: 'Article' }} />
    </Stack>
  );
}
