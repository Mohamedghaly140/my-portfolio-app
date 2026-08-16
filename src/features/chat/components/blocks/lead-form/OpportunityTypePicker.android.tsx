import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Host } from "@expo/ui";
import {
  DropdownMenuItem,
  ExposedDropdownMenu,
  ExposedDropdownMenuBox,
  OutlinedTextField,
  useNativeState,
} from "@expo/ui/jetpack-compose";
import { menuAnchor } from "@expo/ui/jetpack-compose/modifiers";

import { Text } from "@/components/ui";
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
  const [expanded, setExpanded] = useState(false);
  const label = value ? OPPORTUNITY_TYPE_LABELS[value] : PLACEHOLDER;
  const anchorText = useNativeState(label);

  useEffect(() => {
    anchorText.set(label);
  }, [label, anchorText]);

  return (
    <View style={styles.root}>
      <Text color="textMuted" role="label">
        Opportunity type
      </Text>
      <Host matchContents style={styles.host}>
        <ExposedDropdownMenuBox
          expanded={expanded}
          onExpandedChange={setExpanded}
        >
          <OutlinedTextField
            colors={{
              focusedIndicatorColor: colors.accentText,
              cursorColor: colors.accentText,
            }}
            isError={!!error}
            modifiers={[menuAnchor()]}
            readOnly
            singleLine
            value={anchorText}
          />
          <ExposedDropdownMenu
            expanded={expanded}
            onDismissRequest={() => setExpanded(false)}
          >
            {OPPORTUNITY_TYPES.map((type) => (
              <DropdownMenuItem
                key={type}
                onClick={() => {
                  onChange(type);
                  setExpanded(false);
                }}
              >
                <DropdownMenuItem.Text>
                  {OPPORTUNITY_TYPE_LABELS[type]}
                </DropdownMenuItem.Text>
              </DropdownMenuItem>
            ))}
          </ExposedDropdownMenu>
        </ExposedDropdownMenuBox>
      </Host>
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
  host: {
    width: "100%",
  },
});
