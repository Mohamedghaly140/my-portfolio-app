import { StyleSheet, View } from "react-native";

import { ProjectCard } from "@/components/project-card";
import type { ProjectGridBlock } from "@/features/chat/blocks";
import { getProjectBySlug } from "@/data/projects";
import { Spacing } from "@/theme";

export type ProjectGridProps = {
  block: ProjectGridBlock;
};

export function ProjectGrid({ block }: ProjectGridProps) {
  const projects = block.slugs
    .map((slug) => getProjectBySlug(slug))
    .filter((project): project is NonNullable<typeof project> => project !== undefined);

  if (projects.length === 0) return null;

  return (
    <View accessibilityLabel="Relevant projects" style={styles.root}>
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.three,
  },
});
