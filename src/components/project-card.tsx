import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { Badge, Card, Text } from '@/components/ui';
import { projectCoverImages } from '@/data/projects';
import { selectionChanged } from '@/lib/haptics';
import type { Project } from '@/types/project';
import { Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const { colors } = useTheme();
  const cover = projectCoverImages[project.slug];

  function handlePress() {
    selectionChanged();
    router.push({
      pathname: '/projects/[slug]',
      params: { slug: project.slug },
    });
  }

  return (
    <Card
      accessibilityLabel={`${project.title}, ${project.category} project`}
      onPress={handlePress}
      style={styles.card}
    >
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
          <Text color="textMuted" role="small">
            Case Study
          </Text>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Ionicons color={colors.accentText} name="chevron-forward" size={16} />
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
    paddingTop: Spacing.two + Spacing.half,
  },
});
