import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Reveal, SectionLabel, Text } from '@/components/ui';
import { projects } from '@/data/projects';
import { Motion, Spacing } from '@/theme';

import { ProjectFilter } from './components/project-filter';
import { ProjectGrid } from './components/project-grid';

const categories = [...new Set(projects.map((p) => p.category))];

export function ProjectsScreen() {
  const [active, setActive] = useState<string>('All');
  const filtered =
    active === 'All' ? projects : projects.filter((p) => p.category === active);

  return (
    <View style={styles.root}>
      <Reveal>
        <SectionLabel>Work</SectionLabel>
        <Text accessibilityRole="header" role="heading" style={styles.title}>
          Projects
        </Text>
        <Text color="textMuted" role="body" style={styles.supporting}>
          {
            "A selection of apps and products I've shipped. Click any card for the full case study."
          }
        </Text>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs}>
        <View style={styles.filter}>
          <ProjectFilter
            active={active}
            categories={categories}
            onChange={setActive}
          />
        </View>
      </Reveal>

      <ProjectGrid projects={filtered} />
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
  filter: {
    marginBottom: Spacing.four,
  },
});
