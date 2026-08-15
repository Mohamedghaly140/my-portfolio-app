import { Ionicons } from '@expo/vector-icons';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { router, Stack } from 'expo-router';
import { Pressable } from 'react-native';

import { FontFamilies } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

function ChatCloseButton({ tintColor }: { tintColor: string }) {
  return (
    <Pressable
      accessibilityLabel="Close chat"
      accessibilityRole="button"
      hitSlop={8}
      onPress={() => router.back()}
    >
      <Ionicons color={tintColor} name="close" size={24} />
    </Pressable>
  );
}

export default function ChatStackLayout() {
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
        title: 'Mo Ghaly GPT',
        headerLargeTitle: true,
        headerTransparent: true,
        headerBlurEffect,
        headerLargeTitleStyle: { fontFamily: FontFamilies.displayBold },
        headerLeft: () => <ChatCloseButton tintColor={colors.accentText} />,
      }
    : {
        ...shared,
        title: 'Mo Ghaly GPT',
        headerStyle: { backgroundColor: colors.bg },
        headerLeft: () => <ChatCloseButton tintColor={colors.accentText} />,
      };

  return (
    <Stack>
      <Stack.Screen name="index" options={indexOptions} />
    </Stack>
  );
}
