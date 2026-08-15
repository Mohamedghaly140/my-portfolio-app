import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Badge, Card, Text } from '@/components/ui';
import type { CourseItem } from '@/types/course';
import { Spacing } from '@/theme';

export type CourseCardProps = {
  item: CourseItem;
};

export function CourseCard({ item }: CourseCardProps) {
  function handleCertificatePress() {
    if (item.certificateUrl) {
      void Linking.openURL(item.certificateUrl);
    }
  }

  return (
    <Card style={styles.card}>
      <View style={styles.body}>
        <View style={styles.heading}>
          <Text role="subheading">{item.name}</Text>
          <Badge label={item.provider} variant="muted" />
        </View>

        {item.year ? (
          <Text color="textMuted" role="small">
            {item.year}
          </Text>
        ) : null}

        {item.certificateUrl ? (
          <Pressable
            accessibilityRole="link"
            hitSlop={8}
            onPress={handleCertificatePress}
          >
            <Text color="accent" role="small">
              View Certificate →
            </Text>
          </Pressable>
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
    gap: Spacing.two,
  },
});
