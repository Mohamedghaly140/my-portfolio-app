import { StyleSheet, View } from 'react-native';

import { AskMohamedCTA } from '@/components/ask-mohamed-cta';
import { Divider, Reveal, SectionLabel, Text } from '@/components/ui';
import { courses } from '@/data/courses';
import { education } from '@/data/education';
import { experience } from '@/data/experience';
import { Motion, Spacing } from '@/theme';

import { CourseCard } from './components/course-card';
import { EducationCard } from './components/education-card';
import { Timeline } from './components/timeline';

export function ExperienceScreen() {
  const educationSectionDelay = experience.length * Motion.staggerMs;
  const courseworkSectionDelay =
    educationSectionDelay + (1 + education.length) * Motion.staggerMs;

  return (
    <View style={styles.root}>
      <Reveal>
        <SectionLabel>Career</SectionLabel>
        <Text accessibilityRole="header" role="heading" style={styles.title}>
          Work Experience
        </Text>
        <Text color="textMuted" role="body" style={styles.supporting}>
          {
            "A timeline of the companies and teams I've built products with."
          }
        </Text>
      </Reveal>

      <Timeline items={experience} />

      <Reveal delayMs={educationSectionDelay}>
        <View style={styles.sectionBreak}>
          <Divider />
        </View>
        <SectionLabel>Education</SectionLabel>
        <Text accessibilityRole="header" role="heading" style={styles.sectionTitle}>
          Academic background.
        </Text>
      </Reveal>

      <View style={styles.cardList}>
        {education.map((item, index) => (
          <Reveal
            key={item.institution}
            delayMs={educationSectionDelay + (index + 1) * Motion.staggerMs}
          >
            <EducationCard item={item} />
          </Reveal>
        ))}
      </View>

      <Reveal delayMs={courseworkSectionDelay}>
        <View style={styles.sectionBreak}>
          <Divider />
        </View>
        <SectionLabel>Learning</SectionLabel>
        <Text accessibilityRole="header" role="heading" style={styles.sectionTitle}>
          Relevant Coursework.
        </Text>
      </Reveal>

      <View style={styles.cardList}>
        {courses.map((item, index) => (
          <Reveal
            key={item.name}
            delayMs={courseworkSectionDelay + (index + 1) * Motion.staggerMs}
          >
            <CourseCard item={item} />
          </Reveal>
        ))}
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
  sectionBreak: {
    marginBottom: Spacing.five,
    marginTop: Spacing.five,
  },
  sectionTitle: {
    marginBottom: Spacing.four,
    marginTop: Spacing.two + Spacing.half,
  },
  cardList: {
    gap: Spacing.three,
  },
});
