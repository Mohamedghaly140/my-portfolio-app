import { StyleSheet, View } from 'react-native';

import { ProjectCard } from '@/components/project-card';
import { Reveal, Text } from '@/components/ui';
import type { Project } from '@/types/project';
import { Motion, Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type ProjectGridProps = {
  projects: Project[];
};

export function ProjectGrid({ projects }: ProjectGridProps) {
  const { colors } = useTheme();

  if (projects.length === 0) {
    return (
      <View style={[styles.empty, { borderColor: colors.border }]}>
        <Text color="textMuted" role="label">
          No projects in this category yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {projects.map((project, index) => (
        <Reveal key={project.slug} delayMs={index * Motion.staggerMs}>
          <ProjectCard project={project} />
        </Reveal>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
  empty: {
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 256,
    opacity: 0.5,
  },
});
