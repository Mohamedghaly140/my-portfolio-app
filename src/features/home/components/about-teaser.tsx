import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Reveal, SectionLabel, Text } from '@/components/ui';
import { Motion, Spacing } from '@/theme';

export function AboutTeaser() {
  function handleOpenAbout() {
    router.push('/about');
  }

  return (
    <View style={styles.section}>
      <Reveal>
        <SectionLabel>About Me</SectionLabel>
        <Text accessibilityRole="header" role="heading" style={styles.title}>
          The engineer behind the code.
        </Text>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs}>
        <Text color="textMuted" role="body">
          {
            "I'm a Flutter & Frontend Engineer with 5+ years of experience building production-grade mobile apps and web interfaces. I care deeply about clean architecture, developer experience, and shipping things that actually work."
          }
        </Text>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 2}>
        <Text color="textMuted" role="body">
          My work spans real-time AI streaming apps, cross-platform mobile products, and
          complex frontend systems. I lean on Clean Architecture, Bloc/Cubit, and strong
          typing to keep codebases maintainable as they scale.
        </Text>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 3}>
        <Text color="textMuted" role="body">
          {
            "When I'm not building, I'm learning — exploring new tooling, contributing to the Flutter ecosystem, and occasionally shipping side projects that scratch my own itches."
          }
        </Text>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 4}>
        <Pressable accessibilityRole="link" hitSlop={8} onPress={handleOpenAbout}>
          <Text color="accent" role="small">
            → More About Me
          </Text>
        </Pressable>
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three,
    paddingVertical: Spacing.section,
  },
  title: {
    marginTop: Spacing.two + Spacing.half,
  },
});
