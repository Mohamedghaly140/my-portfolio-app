import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Badge, Reveal, SectionLabel, Text } from '@/components/ui';
import { skillCategories } from '@/data/skills';
import { Motion, Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

import { SKILLS_TEASER_COUNT } from '../constants';

export function SkillsHighlight() {
  const { colors } = useTheme();

  function handleOpenSkills() {
    router.push('/skills');
  }

  return (
    <Pressable
      accessibilityLabel="Toolkit. View all skills."
      accessibilityRole="button"
      onPress={handleOpenSkills}
      style={[styles.section, { backgroundColor: colors.surface }]}
    >
      <Reveal>
        <SectionLabel>Toolkit</SectionLabel>
        <Text accessibilityRole="header" role="heading" style={styles.title}>
          The tools I use to build things.
        </Text>
      </Reveal>

      <View style={styles.grid}>
        {skillCategories.map((category, index) => (
          <Reveal key={category.category} delayMs={index * Motion.staggerMs}>
            <View style={styles.category}>
              <Text
                color="textMuted"
                role="label"
                style={[styles.categoryHeading, { borderBottomColor: colors.border }]}
              >
                {category.category}
              </Text>
              <View style={styles.badges}>
                {category.skills.slice(0, SKILLS_TEASER_COUNT).map((skill) => (
                  <Badge key={skill.name} label={skill.name} variant="accent" />
                ))}
              </View>
            </View>
          </Reveal>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: -Spacing.gutter,
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.section,
  },
  title: {
    marginBottom: Spacing.four,
    marginTop: Spacing.two + Spacing.half,
  },
  grid: {
    gap: Spacing.four,
  },
  category: {
    gap: Spacing.two + Spacing.half,
  },
  categoryHeading: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: Spacing.two,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
