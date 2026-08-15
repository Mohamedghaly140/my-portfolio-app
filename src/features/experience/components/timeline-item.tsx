import { StyleSheet, View } from 'react-native';

import { Badge, Text } from '@/components/ui';
import type { ExperienceItem as ExperienceItemType } from '@/types/experience';
import { Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type TimelineItemProps = {
  item: ExperienceItemType;
  isLast?: boolean;
};

export function TimelineItem({ item, isLast = false }: TimelineItemProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <View style={styles.spine}>
        <View
          style={[
            styles.dot,
            item.current
              ? {
                  backgroundColor: colors.accent,
                  borderColor: colors.accent,
                }
              : {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                },
          ]}
        />
        {!isLast ? (
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        ) : null}
      </View>

      <View style={[styles.content, !isLast && styles.contentSpaced]}>
        <View style={styles.meta}>
          <View style={styles.roleBlock}>
            <Text role="subheading">{item.role}</Text>
            <Text color="accent" role="small">
              {item.company}
            </Text>
          </View>
          <View style={styles.periodBlock}>
            <Text color="textMuted" role="small">
              {item.period}
            </Text>
            <Text color="textMuted" role="small">
              {item.location}
            </Text>
          </View>
        </View>

        <Text color="textMuted" role="small">
          {item.description}
        </Text>

        <View style={styles.tags}>
          {item.tags.map((tag) => (
            <Badge key={tag} label={tag} variant="code" />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  spine: {
    alignItems: 'center',
    width: 12,
  },
  dot: {
    borderWidth: 2,
    height: 12,
    marginTop: 6,
    width: 12,
  },
  line: {
    flex: 1,
    marginTop: Spacing.two,
    width: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
    gap: Spacing.two + Spacing.half,
  },
  contentSpaced: {
    paddingBottom: Spacing.five,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  roleBlock: {
    flexGrow: 1,
    flexShrink: 1,
    gap: Spacing.half,
    minWidth: '55%',
  },
  periodBlock: {
    gap: Spacing.half,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
