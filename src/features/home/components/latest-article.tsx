import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Badge, Button, Card, Reveal, SectionLabel, Text } from '@/components/ui';
import { getLatestPost } from '@/data/blog';
import { Motion, Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export function LatestArticle() {
  const { colors } = useTheme();
  const latest = getLatestPost();

  if (!latest) {
    return null;
  }

  function handleOpenBlog() {
    router.push('/(tabs)/(blog)');
  }

  return (
    <View style={styles.section}>
      <Reveal>
        <SectionLabel>Latest Writing</SectionLabel>
        <Text accessibilityRole="header" role="heading" style={styles.title}>
          From the blog.
        </Text>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs}>
        <Card onPress={handleOpenBlog} style={styles.card}>
          <View style={styles.cardBody}>
            <Text color="textMuted" role="small">
              {latest.date}
            </Text>
            <Text role="subheading">{latest.title}</Text>
            <Text color="textMuted" role="small">
              {latest.excerpt}
            </Text>
            <View style={styles.tags}>
              {latest.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} label={tag} variant="code" />
              ))}
            </View>
            <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
              <Text color="accent" role="small">
                Read Article →
              </Text>
            </View>
          </View>
        </Card>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 2}>
        <View style={styles.cta}>
          <Button label="Read More Articles →" onPress={handleOpenBlog} variant="ghost" />
        </View>
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.section,
  },
  title: {
    marginBottom: Spacing.four,
    marginTop: Spacing.two + Spacing.half,
  },
  card: {
    maxWidth: 420,
  },
  cardBody: {
    gap: Spacing.two + Spacing.half,
    padding: Spacing.three + Spacing.one,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.one,
  },
  cardFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.two,
    paddingTop: Spacing.two + Spacing.half,
  },
  cta: {
    alignItems: 'center',
    marginTop: Spacing.four,
  },
});
