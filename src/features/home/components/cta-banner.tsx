import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Button, Reveal, SectionLabel, Text } from '@/components/ui';
import { Motion, Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

import { openCv } from '@/lib/open-cv';

export function CTABanner() {
  const { colors } = useTheme();

  function handleContact() {
    router.push('/(tabs)/(contact)');
  }

  return (
    <View style={styles.section}>
      <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />

      <Reveal>
        <View style={styles.header}>
          <SectionLabel>{"Let's Work Together"}</SectionLabel>
          <Text accessibilityRole="header" role="heading" style={styles.title}>
            Got a project in mind?
          </Text>
          <Text color="textMuted" role="body" style={styles.body}>
            {
              "I'm open to freelance, contract, and full-time opportunities. Let's build something great together."
            }
          </Text>
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs}>
        <View style={styles.actions}>
          <Button
            icon={{ name: 'arrow-forward' }}
            label="Let's Talk"
            onPress={handleContact}
            variant="primary"
          />
          <Button
            icon={{ name: 'arrow-down' }}
            label="View Resume"
            onPress={openCv}
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
    position: 'relative',
  },
  accentBar: {
    height: 2,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
  },
  body: {
    marginBottom: Spacing.two,
    maxWidth: 480,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
});
