import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { Badge, Button, Card, Reveal, SectionLabel, Text } from '@/components/ui';
import { getFeaturedProjects, projectCoverImages } from '@/data/projects';
import type { Project } from '@/types/project';
import { Motion, Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

function PlaceholderCard() {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.placeholder,
        { borderColor: colors.border },
      ]}
    >
      <Text color="textMuted" role="label">
        Coming Soon
      </Text>
    </View>
  );
}

function FeaturedProjectCard({ project }: { project: Project }) {
  const { colors } = useTheme();
  const cover = projectCoverImages[project.slug];

  function handlePress() {
    router.push({
      pathname: '/projects/[slug]',
      params: { slug: project.slug },
    });
  }

  return (
    <Card onPress={handlePress} style={styles.card}>
      <View style={[styles.cover, { borderBottomColor: colors.border }]}>
        {cover ? (
          <Image
            accessibilityLabel={project.coverImage?.alt}
            contentFit="contain"
            source={cover}
            style={styles.coverImage}
          />
        ) : (
          <View style={[styles.coverFallback, { backgroundColor: colors.surface }]}>
            <Text color="textMuted" role="title" style={styles.letter}>
              {project.title.charAt(0)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <Badge label={project.category} variant="muted" />
          {project.company ? (
            <Text color="textMuted" role="small">
              @ {project.company}
            </Text>
          ) : null}
        </View>

        <Text role="subheading">{project.title}</Text>
        <Text color="textMuted" role="small">
          {project.description}
        </Text>

        <View style={styles.tags}>
          {project.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} label={tag} variant="code" />
          ))}
        </View>

        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <Text color="accent" role="small">
            Case Study →
          </Text>
        </View>
      </View>
    </Card>
  );
}

export function FeaturedProjects() {
  const featured = getFeaturedProjects();
  const placeholderCount = Math.max(0, 3 - featured.length);

  function handleViewAll() {
    router.push('/projects');
  }

  return (
    <View style={styles.section}>
      <Reveal>
        <SectionLabel>Selected Work</SectionLabel>
        <Text accessibilityRole="header" role="heading" style={styles.title}>
          {"Things I've built."}
        </Text>
      </Reveal>

      <View style={styles.list}>
        {featured.map((project, index) => (
          <Reveal key={project.slug} delayMs={index * Motion.staggerMs}>
            <FeaturedProjectCard project={project} />
          </Reveal>
        ))}
        {Array.from({ length: placeholderCount }, (_, index) => (
          <Reveal
            key={`placeholder-${index}`}
            delayMs={(featured.length + index) * Motion.staggerMs}
          >
            <PlaceholderCard />
          </Reveal>
        ))}
      </View>

      <Reveal delayMs={Motion.staggerMs * 3}>
        <View style={styles.cta}>
          <Button label="View All Projects →" onPress={handleViewAll} variant="ghost" />
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
  list: {
    gap: Spacing.three,
  },
  card: {
    overflow: 'hidden',
  },
  cover: {
    aspectRatio: 16 / 9,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  coverImage: {
    height: '100%',
    width: '100%',
  },
  coverFallback: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  letter: {
    opacity: 0.15,
  },
  cardBody: {
    gap: Spacing.two + Spacing.half,
    padding: Spacing.three + Spacing.one,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
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
  placeholder: {
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 256,
    opacity: 0.5,
  },
  cta: {
    alignItems: 'center',
    marginTop: Spacing.four,
  },
});
