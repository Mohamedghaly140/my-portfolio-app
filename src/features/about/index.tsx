import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { AskMohamedCTA } from '@/components/ask-mohamed-cta';
import { Badge, Button, Reveal, SectionLabel, Text } from '@/components/ui';
import { skillCategories } from '@/data/skills';
import { openCv } from '@/lib/open-cv';
import { Motion, Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

const AVATAR = require('@/assets/images/avatar.jpg');

const BIO_PARAGRAPHS = [
  "I'm Mohamed Ghaly — a Flutter & Frontend Engineer based in Egypt with 5+ years of experience building production-grade mobile apps and web interfaces. I care deeply about clean architecture, developer experience, and shipping things that actually work in the real world.",
  'My work spans real-time AI streaming mobile apps, cross-platform products used by thousands of users, and complex frontend systems. I lean heavily on Clean Architecture, Bloc/Cubit, and strong typing to keep codebases maintainable as they scale. I believe code is a communication tool — it should be as clear to the next engineer as it is to the compiler.',
  "When I'm not building, I'm learning — exploring new tooling, contributing to the Flutter ecosystem, running a YouTube channel on mobile development, and occasionally shipping side projects that scratch my own itches.",
  'Currently open to senior Flutter / frontend roles and interesting freelance projects. Based in Egypt, available remotely worldwide.',
] as const;

export function AboutScreen() {
  const { colors } = useTheme();

  function handleGetInTouch() {
    router.push('/(tabs)/(contact)');
  }

  function handleWorkHistory() {
    router.push('/(tabs)/(experience)');
  }

  function handleProjects() {
    router.push('/projects');
  }

  function handleSkills() {
    router.push('/skills');
  }

  return (
    <View style={styles.root}>
      <Reveal>
        <SectionLabel>About Me</SectionLabel>
        <Text accessibilityRole="header" role="heading" style={styles.title}>
          The engineer behind the code.
        </Text>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs}>
        <View style={styles.photoBio}>
          <Image
            accessibilityLabel="Mohamed Ghaly"
            contentFit="cover"
            source={AVATAR}
            style={[styles.avatar, { borderColor: colors.accentBorder }]}
          />

          <View style={styles.bio}>
            {BIO_PARAGRAPHS.map((paragraph) => (
              <Text key={paragraph.slice(0, 24)} color="textMuted" role="body">
                {paragraph}
              </Text>
            ))}

            <View style={styles.actions}>
              <Button
                icon={{ name: 'arrow-forward' }}
                label="Get In Touch"
                onPress={handleGetInTouch}
                variant="primary"
              />
              <Button
                icon={{ name: 'arrow-down' }}
                label="Download CV"
                onPress={openCv}
                variant="ghost"
              />
            </View>
          </View>
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 2}>
        <View style={[styles.skillsSummary, { borderTopColor: colors.border }]}>
          <Text accessibilityRole="header" role="heading" style={styles.skillsHeading}>
            What I work with.
          </Text>
          <View style={styles.categories}>
            {skillCategories.map((category, index) => (
              <Reveal key={category.category} delayMs={index * Motion.staggerMs}>
                <View style={styles.category}>
                  <Text color="accentText" role="label">
                    {category.category}
                  </Text>
                  <View style={styles.badges}>
                    {category.skills.map((skill) => (
                      <Badge key={skill.name} label={skill.name} variant="muted" />
                    ))}
                  </View>
                </View>
              </Reveal>
            ))}
          </View>
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 3}>
        <View style={[styles.links, { borderTopColor: colors.border }]}>
          <Pressable accessibilityRole="link" hitSlop={8} onPress={handleWorkHistory}>
            <Text color="accent" role="small">
              → Work History
            </Text>
          </Pressable>
          <Pressable accessibilityRole="link" hitSlop={8} onPress={handleProjects}>
            <Text color="accent" role="small">
              → Projects
            </Text>
          </Pressable>
          <Pressable accessibilityRole="link" hitSlop={8} onPress={handleSkills}>
            <Text color="accent" role="small">
              → Full Skills List
            </Text>
          </Pressable>
        </View>
      </Reveal>

      <AskMohamedCTA variant="compact" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingBottom: Spacing.four,
  },
  title: {
    marginBottom: Spacing.four,
    marginTop: Spacing.two + Spacing.half,
  },
  photoBio: {
    gap: Spacing.four,
    paddingVertical: Spacing.three,
  },
  avatar: {
    alignSelf: 'center',
    aspectRatio: 1,
    borderWidth: 2,
    maxWidth: 320,
    width: '100%',
  },
  bio: {
    gap: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two + Spacing.half,
    paddingTop: Spacing.two,
  },
  skillsSummary: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.five,
  },
  skillsHeading: {
    marginBottom: Spacing.four,
  },
  categories: {
    gap: Spacing.four,
  },
  category: {
    gap: Spacing.two + Spacing.half,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  links: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
    marginTop: Spacing.five,
    paddingTop: Spacing.four,
  },
});
