import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { Pressable, StyleSheet, View } from "react-native";

import { Card, Text } from "@/components/ui";
import { selectionChanged } from "@/lib/haptics";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

export type ContactChannelItem = {
  id: string;
  label: string;
  value: string;
  href?: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

export type ChannelListProps = {
  heading?: string;
  items: ContactChannelItem[];
};

export function ChannelList({ heading, items }: ChannelListProps) {
  const { colors } = useTheme();

  return (
    <Card style={styles.card}>
      {heading ? (
        <Text color="textMuted" role="small" style={styles.heading}>
          {heading}
        </Text>
      ) : null}
      <View style={styles.list}>
        {items.map((item) =>
          item.href ? (
            <Pressable
              accessibilityLabel={`${item.label}, ${item.value}`}
              accessibilityRole="link"
              key={item.id}
              onPress={() => {
                selectionChanged();
                void Linking.openURL(item.href!);
              }}
              style={styles.row}
            >
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <Ionicons
                  color={colors.accentText}
                  name={item.icon}
                  size={18}
                  style={styles.icon}
                />
              </View>
              <View style={styles.copy}>
                <Text color="textMuted" role="small">
                  {item.label}
                </Text>
                <Text color="accentText" role="body">
                  {item.value}
                </Text>
              </View>
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <Ionicons
                  color={colors.accentText}
                  name="chevron-forward"
                  size={16}
                />
              </View>
            </Pressable>
          ) : (
            <View
              accessibilityLabel={`${item.label}, ${item.value}`}
              key={item.id}
              style={styles.row}
            >
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <Ionicons
                  color={colors.textMuted}
                  name={item.icon}
                  size={18}
                  style={styles.icon}
                />
              </View>
              <View style={styles.copy}>
                <Text color="textMuted" role="small">
                  {item.label}
                </Text>
                <Text role="body">{item.value}</Text>
              </View>
            </View>
          ),
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  heading: {
    marginBottom: Spacing.two,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.two,
    minHeight: 44,
  },
  icon: {
    marginTop: 2,
  },
  copy: {
    flex: 1,
    gap: Spacing.half,
  },
});
