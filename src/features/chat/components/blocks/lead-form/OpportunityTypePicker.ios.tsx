import { StyleSheet, View } from "react-native";
import { Host } from "@expo/ui";
import { Picker, Text as SwiftUIText } from "@expo/ui/swift-ui";
import { pickerStyle, tag, tint } from "@expo/ui/swift-ui/modifiers";

import { Card, Text } from "@/components/ui";
import {
  OPPORTUNITY_TYPES,
  OPPORTUNITY_TYPE_LABELS,
  type OpportunityType,
} from "@/types/lead";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

export type OpportunityTypePickerProps = {
  value: OpportunityType | "";
  onChange: (value: OpportunityType) => void;
  error?: string;
};

const PLACEHOLDER = "Select an opportunity type";

export function OpportunityTypePicker({
  value,
  onChange,
  error,
}: OpportunityTypePickerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <Text color="textMuted" role="label">
        Opportunity type
      </Text>
      <Card style={styles.card}>
        <Host matchContents>
          <Picker
            label={PLACEHOLDER}
            modifiers={[pickerStyle("menu"), tint(colors.accentText)]}
            onSelectionChange={(selection) => {
              if (selection) onChange(selection as OpportunityType);
            }}
            selection={value || undefined}
          >
            {OPPORTUNITY_TYPES.map((type) => (
              <SwiftUIText key={type} modifiers={[tag(type)]}>
                {OPPORTUNITY_TYPE_LABELS[type]}
              </SwiftUIText>
            ))}
          </Picker>
        </Host>
      </Card>
      {error ? (
        <Text color="danger" role="small">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.one,
  },
  card: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
