import { StyleSheet, View } from 'react-native';

import { BlogPostCard } from '@/components/blog-post-card';
import { Reveal, SectionLabel, Text } from '@/components/ui';
import { getPublishedPosts } from '@/data/blog';
import { Motion, Spacing } from '@/theme';

export function BlogIndexScreen() {
  const posts = getPublishedPosts();

  return (
    <View style={styles.root}>
      <Reveal>
        <SectionLabel>Writing</SectionLabel>
        <Text accessibilityRole="header" role="heading" style={styles.title}>
          Blog
        </Text>
        <Text color="textMuted" role="body" style={styles.supporting}>
          Notes on real-time systems, Flutter, and web engineering — written from
          shipped products, not slides.
        </Text>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs}>
        {posts.length === 0 ? (
          <Text color="textMuted" role="body">
            No articles published yet.
          </Text>
        ) : (
          <View style={styles.list}>
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </View>
        )}
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingBottom: Spacing.four,
  },
  title: {
    marginTop: Spacing.two + Spacing.half,
  },
  supporting: {
    marginBottom: Spacing.four,
    marginTop: Spacing.three,
  },
  list: {
    gap: Spacing.three,
  },
});
