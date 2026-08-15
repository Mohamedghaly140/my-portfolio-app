import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack } from 'expo-router';

import { FontFamilies } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export default function SettingsStackLayout() {
  const { colors, scheme } = useTheme();
  const isIOS = process.env.EXPO_OS === 'ios';

  const shared = {
    headerShadowVisible: false,
    headerTintColor: colors.accentText,
    headerTitleStyle: { fontFamily: FontFamilies.displayBold },
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
        title: 'Settings',
        headerLargeTitle: true,
        headerTransparent: true,
        headerBlurEffect,
        headerLargeTitleStyle: { fontFamily: FontFamilies.displayBold },
      }
    : {
        ...shared,
        title: 'Settings',
        headerStyle: { backgroundColor: colors.bg },
      };

  return (
    <Stack>
      <Stack.Screen name="index" options={indexOptions} />
    </Stack>
  );
}
