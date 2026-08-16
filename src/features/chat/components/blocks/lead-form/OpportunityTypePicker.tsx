import { StyleSheet, View } from "react-native";

import { Button, Card, Text } from "@/components/ui";
import {
  OPPORTUNITY_TYPES,
  OPPORTUNITY_TYPE_LABELS,
  type OpportunityType,
} from "@/types/lead";
import { Spacing } from "@/theme";

export type OpportunityTypePickerProps = {
  value: OpportunityType | "";
  onChange: (value: OpportunityType) => void;
  error?: string;
};

export function OpportunityTypePicker({
  value,
  onChange,
  error,
}: OpportunityTypePickerProps) {
  return (
    <View style={styles.root}>
      <Text color="textMuted" role="label">
        Opportunity type
      </Text>
      <Card>
        <View style={styles.row}>
          {OPPORTUNITY_TYPES.map((type) => (
            <Button
              key={type}
              label={OPPORTUNITY_TYPE_LABELS[type]}
              onPress={() => onChange(type)}
              variant={value === type ? "primary" : "ghost"}
            />
          ))}
        </View>
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
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    padding: Spacing.three,
  },
});
