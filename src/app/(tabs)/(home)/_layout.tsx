import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Stack } from "expo-router";

import { BackHeaderButton } from "@/components/back-header-button";
import { FontFamilies } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

/**
 * About, Projects, Project detail, Skills and Privacy push onto this stack
 * (M3). They are deliberately not tabs.
 */
export default function HomeStackLayout() {
  const { colors, scheme } = useTheme();
  const isIOS = process.env.EXPO_OS === "ios";

  const shared = {
    headerShadowVisible: false,
    headerTintColor: colors.accentText,
    headerTitleStyle: { fontFamily: FontFamilies.displayBold },
    headerBackButtonDisplayMode: "minimal" as const,
    headerLeft: ({ canGoBack }: { canGoBack?: boolean }) =>
      canGoBack ? <BackHeaderButton tintColor={colors.accentText} /> : undefined,
  };

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
      ? scheme === "dark"
        ? ("systemMaterialDark" as const)
        : ("systemMaterialLight" as const)
      : undefined;

  const indexOptions = isIOS
    ? {
        ...shared,
        title: "Home",
        headerLargeTitle: true,
        headerTransparent: true,
        headerStyle: undefined,
        headerBlurEffect,
        headerLargeTitleStyle: { fontFamily: FontFamilies.displayBold },
      }
    : {
        ...pushed,
        title: "Home",
      };

  return (
    <Stack screenOptions={pushed}>
      <Stack.Screen name="index" options={indexOptions} />
      <Stack.Screen name="gallery" options={{ title: "Token gallery" }} />
      <Stack.Screen name="about" options={{ title: "About" }} />
      <Stack.Screen name="skills" options={{ title: "Skills" }} />
      <Stack.Screen name="projects/index" options={{ title: "Projects" }} />
      <Stack.Screen name="projects/[slug]" options={{ title: "Project" }} />
    </Stack>
  );
}
