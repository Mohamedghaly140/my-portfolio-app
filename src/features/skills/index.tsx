import { StyleSheet, View } from 'react-native';

import { AskMohamedCTA } from '@/components/ask-mohamed-cta';
import { Reveal, SectionLabel, Text } from '@/components/ui';
import { skillCategories } from '@/data/skills';
import { Motion, Spacing } from '@/theme';

import { LanguagesSection } from './components/languages-section';
import { SkillCategory } from './components/skill-category';
import { SoftSkillsSection } from './components/soft-skills-section';

export function SkillsScreen() {
  const softSkillsIndex = skillCategories.length;
  const languagesIndex = softSkillsIndex + 1;

  return (
    <View style={styles.root}>
      <Reveal>
        <SectionLabel>Toolkit</SectionLabel>
        <Text accessibilityRole="header" role="heading" style={styles.title}>
          Skills & Technologies
        </Text>
        <Text color="textMuted" role="body" style={styles.supporting}>
          Tools I reach for in production. No fake progress bars — just honest
          categorisation with experience level.
        </Text>
      </Reveal>

      <View style={styles.sections}>
        {skillCategories.map((category, index) => (
          <Reveal key={category.category} delayMs={index * Motion.staggerMs}>
            <SkillCategory category={category} />
          </Reveal>
        ))}

        <Reveal delayMs={softSkillsIndex * Motion.staggerMs}>
          <SoftSkillsSection />
        </Reveal>

        <Reveal delayMs={languagesIndex * Motion.staggerMs}>
          <LanguagesSection />
        </Reveal>
      </View>

      <AskMohamedCTA variant="compact" />
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
    marginBottom: Spacing.five,
    marginTop: Spacing.three,
  },
  sections: {
    gap: Spacing.five,
  },
});
