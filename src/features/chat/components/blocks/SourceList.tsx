import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { Text } from "@/components/ui";
import type { SourceListBlock } from "@/features/chat/blocks";
import { getProjectBySlug } from "@/data/projects";
import { selectionChanged } from "@/lib/haptics";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

export type SourceListProps = {
  block: SourceListBlock;
};

export function SourceList({ block }: SourceListProps) {
  const { colors } = useTheme();
  const sources = block.slugs
    .map((slug) => getProjectBySlug(slug))
    .filter((project): project is NonNullable<typeof project> => project !== undefined);

  if (sources.length === 0) return null;

  function handlePress(slug: string) {
    selectionChanged();
    router.push({
      pathname: "/projects/[slug]",
      params: { slug },
    });
  }

  return (
    <View accessibilityLabel="Sources" style={styles.root}>
      <Text color="textMuted" role="label">
        Sources
      </Text>
      <View style={styles.list}>
        {sources.map((source) => (
          <Pressable
            accessibilityLabel={source.title}
            accessibilityRole="button"
            key={source.slug}
            onPress={() => handlePress(source.slug)}
            style={({ pressed }) => [
              styles.row,
              {
                borderColor: pressed ? colors.borderPressed : colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Text color="textMuted" role="small" style={styles.title}>
              {source.title}
            </Text>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Ionicons color={colors.accentText} name="open-outline" size={14} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.two,
  },
  list: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  row: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.two,
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  title: {
    flexShrink: 1,
  },
});
