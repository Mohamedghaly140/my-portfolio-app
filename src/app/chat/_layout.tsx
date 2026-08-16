import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Pressable } from "react-native";

import { FontFamilies } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

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
  const { colors } = useTheme();

  // A conversation screen is read continuously while scrolling, unlike the
  // browse-style root tab screens docs/01-design-system.md §10 specs a large,
  // collapsing title for — and on iOS 26 (Liquid Glass), a transparent header
  // renders with no blur at all (react-native-screens' confirmed workaround for
  // https://github.com/software-mansion/react-native-screens/issues/3100), which
  // left message text unreadable underneath it. An opaque compact header, same
  // as Android already uses, keeps the header legible in every state.
  const indexOptions = {
    headerShadowVisible: false,
    headerTintColor: colors.accentText,
    headerTitleStyle: { fontFamily: FontFamilies.displayBold },
    title: "Mo Ghaly GPT",
    headerStyle: { backgroundColor: colors.bg },
    headerLeft: () => <ChatCloseButton tintColor={colors.accentText} />,
  } as const;

  return (
    <Stack>
      <Stack.Screen name="index" options={indexOptions} />
      <Stack.Screen
        name="privacy"
        options={{
          title: "Privacy",
          presentation: "modal",
          headerTintColor: colors.accentText,
          headerTitleStyle: { fontFamily: FontFamilies.displayBold },
          headerStyle: { backgroundColor: colors.bg },
          headerLeft: () => <ChatCloseButton tintColor={colors.accentText} />,
        }}
      />
    </Stack>
  );
}
