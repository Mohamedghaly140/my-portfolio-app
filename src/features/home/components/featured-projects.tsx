import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ProjectCard } from '@/components/project-card';
import { Button, Reveal, SectionLabel, Text } from '@/components/ui';
import { getFeaturedProjects } from '@/data/projects';
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
            <ProjectCard project={project} />
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
          <Button
            icon={{ name: 'arrow-forward' }}
            label="View All Projects"
            onPress={handleViewAll}
            variant="ghost"
          />
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
  placeholder: {
    alignItems: 'center',
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
