import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/text";
import { selectionChanged } from "@/lib/haptics";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  accessibilityLabel,
}: CheckboxProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => {
        if (disabled) return;
        selectionChanged();
        onChange(!checked);
      }}
      style={[styles.root, disabled && styles.disabled]}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: checked ? colors.accent : "transparent",
            borderColor: checked ? colors.accent : colors.border,
          },
        ]}
      >
        {checked ? (
          <Ionicons color={colors.onAccent} name="checkmark" size={14} />
        ) : null}
      </View>
      {typeof label === "string" ? (
        <Text role="body" style={styles.label}>
          {label}
        </Text>
      ) : (
        <View style={styles.label}>{label}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.two,
    minHeight: 44,
  },
  disabled: {
    opacity: 0.5,
  },
  box: {
    alignItems: "center",
    borderRadius: 0,
    borderWidth: 1,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  label: {
    flex: 1,
  },
});
