import { StyleSheet, View } from "react-native";

import { Reveal, Text } from "@/components/ui";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

import { useStats } from "../use-stats";

export function StatsStrip() {
  const { colors } = useTheme();
  const { data: stats } = useStats();

  return (
    <Reveal>
      <View style={styles.wrapper}>
        <View style={styles.row}>
          {stats.slice(0, 2).map(stat => (
            <View
              key={stat.label}
              style={[styles.cell, { borderColor: colors.border }]}
            >
              <Text color="accent" role="title" style={styles.value}>
                {stat.value}
              </Text>
              <Text color="textMuted" role="label" style={styles.label}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.row}>
          {stats.slice(2).map(stat => (
            <View
              key={stat.label}
              style={[styles.cell, { borderColor: colors.border }]}
            >
              <Text color="accent" role="title" style={styles.value}>
                {stat.value}
              </Text>
              <Text color="textMuted" role="label" style={styles.label}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  cell: {
    alignItems: "center",
    borderWidth: 1,
    flexBasis: 72,
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
  value: {
    fontSize: 36,
    lineHeight: 44,
  },
  label: {
    marginTop: Spacing.two,
  },
});
