import { StyleSheet, View } from 'react-native';

import { Badge, Card, Text } from '@/components/ui';
import type { EducationItem } from '@/types/education';
import { Spacing } from '@/theme';

export type EducationCardProps = {
  item: EducationItem;
};

export function EducationCard({ item }: EducationCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.body}>
        <View style={styles.heading}>
          <Text role="subheading">{item.institution}</Text>
          <Text color="accent" role="small">
            {item.degree}
          </Text>
        </View>

        <View style={styles.meta}>
          <Text color="textMuted" role="small">
            {item.period}
          </Text>
          <Text color="textMuted" role="small">
            {item.location}
          </Text>
        </View>

        {item.description ? (
          <Text color="textMuted" role="small">
            {item.description}
          </Text>
        ) : null}

        {item.tags && item.tags.length > 0 ? (
          <View style={styles.tags}>
            {item.tags.map((tag) => (
              <Badge key={tag} label={tag} variant="code" />
            ))}
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
  },
  body: {
    gap: Spacing.two + Spacing.half,
    padding: Spacing.four,
  },
  heading: {
    gap: Spacing.one,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two + Spacing.half,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
