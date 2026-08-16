import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { Text } from "@/components/ui/text";
import { Spacing, Typography } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

export type InputProps = {
  label: string;
  optionalHint?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: TextInputProps["keyboardType"];
  autoComplete?: TextInputProps["autoComplete"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  maxLength?: number;
  editable?: boolean;
  variant?: "surface" | "bg";
};

export function Input({
  label,
  optionalHint = false,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  multiline = false,
  numberOfLines,
  keyboardType,
  autoComplete,
  autoCapitalize,
  maxLength,
  editable = true,
  variant = "surface",
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.root}>
      <Text color="textMuted" role="label">
        {label}
        {optionalHint ? (
          <Text color="textMuted" role="small">
            {" "}
            (optional)
          </Text>
        ) : null}
      </Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        editable={editable}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={numberOfLines}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          {
            backgroundColor: colors[variant],
            borderColor: focused ? colors.accent : colors.border,
            color: colors.text,
          },
        ]}
        textAlignVertical={multiline ? "top" : "center"}
        value={value}
      />
      {error ? (
        <View accessibilityLiveRegion="polite">
          <Text color="danger" role="small">
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.one,
  },
  field: {
    ...Typography.body,
    borderRadius: 0,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  fieldMultiline: {
    minHeight: 120,
    paddingTop: Spacing.two,
  },
});
