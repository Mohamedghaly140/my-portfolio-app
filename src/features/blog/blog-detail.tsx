import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { type ReactNode, useLayoutEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { MarkdownBody } from "@/components/markdown-body";
import { ShareHeaderButton } from "@/components/share-header-button";
import {
  Badge,
  Button,
  Divider,
  Reveal,
  Skeleton,
  Text,
} from "@/components/ui";
import { getPostBySlug } from "@/data/blog";
import { parseMarkdownError } from "@/lib/api/markdown";
import { shareBlogPost } from "@/lib/share";
import { Motion, Spacing } from "@/theme";
import type { BlogPost } from "@/types/blog";

import { useArticleMarkdown } from "./use-article-markdown";

function formatPostDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function MetaPair({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.metaPair}>
      <Text color="textMuted" role="label">
        {label}
      </Text>
      {children}
    </View>
  );
}

function BlogPostNotFound() {
  function handleBack() {
    router.push("/(tabs)/blog");
  }

  return (
    <View style={styles.notFound}>
      <Text role="subheading">This article does not exist.</Text>
      <Pressable accessibilityRole="link" hitSlop={8} onPress={handleBack}>
        <Text color="textMuted" role="body">
          ← All Articles
        </Text>
      </Pressable>
    </View>
  );
}

function ArticleBody({ post }: { post: BlogPost }) {
  const { data, isLoading, error, refetch } = useArticleMarkdown(
    `/blog/${post.slug}`,
  );

  if (isLoading) {
    return (
      <View style={styles.skeletonStack}>
        <Skeleton height={16} width="100%" />
        <Skeleton height={16} width="92%" />
        <Skeleton height={16} width="78%" />
        <Skeleton height={16} width="86%" />
      </View>
    );
  }

  if (error) {
    const parsed = parseMarkdownError(error);
    return (
      <View style={styles.errorBlock}>
        <Text color="textMuted" role="body">
          {parsed.message}
        </Text>
        {parsed.retryable ? (
          <Button label="Retry" onPress={() => void refetch()} />
        ) : null}
      </View>
    );
  }

  if (!data) {
    return null;
  }

  return <MarkdownBody markdown={data} />;
}

export function BlogDetailScreen() {
  const navigation = useNavigation();
  const { slug: slugParam } = useLocalSearchParams<{ slug: string }>();
  const slug = typeof slugParam === "string" ? slugParam : slugParam?.[0];
  const post = slug ? getPostBySlug(slug) : undefined;

  useLayoutEffect(() => {
    if (!post || !post.published) return;
    navigation.setOptions({
      headerRight: () => (
        <ShareHeaderButton
          accessibilityLabel="Share article"
          onShare={() => shareBlogPost(post.slug)}
        />
      ),
    });
  }, [navigation, post]);

  if (!post || !post.published) {
    return <BlogPostNotFound />;
  }

  return (
    <View style={styles.root}>
      <Reveal delayMs={Motion.staggerMs}>
        <View style={styles.header}>
          <Text accessibilityRole="header" role="heading" style={styles.title}>
            {post.title}
          </Text>
          <Text color="textMuted" role="body">
            {post.excerpt}
          </Text>
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 2}>
        <View style={styles.metaRow}>
          <MetaPair label="Published">
            <Text role="small">{formatPostDate(post.date)}</Text>
          </MetaPair>

          {post.readingTime ? (
            <MetaPair label="Read time">
              <Text role="small">{post.readingTime}</Text>
            </MetaPair>
          ) : null}
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 3}>
        <View style={styles.tags}>
          {post.tags.map(tag => (
            <Badge key={tag} label={tag} variant="code" />
          ))}
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 4}>
        <View style={styles.body}>
          <Divider />
          <ArticleBody post={post} />
        </View>
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.four,
    paddingBottom: Spacing.four,
    paddingTop: Spacing.two,
  },
  header: {
    gap: Spacing.two + Spacing.half,
  },
  title: {
    marginTop: Spacing.one,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  metaPair: {
    gap: Spacing.one,
    minWidth: 120,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  body: {
    gap: Spacing.four,
  },
  skeletonStack: {
    gap: Spacing.two,
  },
  errorBlock: {
    gap: Spacing.three,
  },
  notFound: {
    alignItems: "center",
    flex: 1,
    gap: Spacing.three,
    justifyContent: "center",
    padding: Spacing.four,
  },
});
