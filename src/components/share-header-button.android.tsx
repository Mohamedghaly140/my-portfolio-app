import { Host } from "@expo/ui";
import { IconButton, RNHostView, Shape } from "@expo/ui/jetpack-compose";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

import { lightImpact } from "@/lib/haptics";
import { useTheme } from "@/theme/theme-provider";

type ShareHeaderButtonProps = {
  accessibilityLabel: string;
  onShare: () => void;
};

/** Icon-only header action that opens the native share sheet. */
export function ShareHeaderButton({
  accessibilityLabel,
  onShare,
}: ShareHeaderButtonProps) {
  const { colors } = useTheme();

  function handlePress() {
    lightImpact();
    onShare();
  }

  return (
    <Host
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      matchContents
      style={styles.host}
    >
      <IconButton
        colors={{ contentColor: colors.accentText }}
        onClick={handlePress}
        shape={Shape.Circle({ radius: 1 })}
      >
        <RNHostView matchContents>
          <Ionicons color={colors.accentText} name="share-outline" size={22} />
        </RNHostView>
      </IconButton>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    height: 44,
    width: 44,
  },
});
