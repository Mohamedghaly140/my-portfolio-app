import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Badge, Card, Text } from '@/components/ui';
import { selectionChanged } from '@/lib/haptics';
import type { BlogPost } from '@/types/blog';
import { Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type BlogPostCardProps = {
  post: BlogPost;
};

function formatPostDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const { colors } = useTheme();

  function handlePress() {
    selectionChanged();
    router.push({
      pathname: '/(tabs)/(blog)/[slug]',
      params: { slug: post.slug },
    });
  }

  return (
    <Card onPress={handlePress} style={styles.card}>
      <View style={styles.cardBody}>
        <Text color="textMuted" role="small">
          {formatPostDate(post.date)}
        </Text>
        <Text role="subheading">{post.title}</Text>
        <Text color="textMuted" role="small">
          {post.excerpt}
        </Text>

        <View style={styles.tags}>
          {post.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} label={tag} variant="code" />
          ))}
        </View>

        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <Text color="textMuted" role="small">
            Read Article
          </Text>
          <Ionicons color={colors.accentText} name="chevron-forward" size={16} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
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
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
    paddingTop: Spacing.two + Spacing.half,
  },
});
