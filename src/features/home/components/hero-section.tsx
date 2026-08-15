import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Button, Reveal, Text } from '@/components/ui';
import { openCv } from '@/lib/open-cv';
import { Motion, Spacing } from '@/theme';

import { ROLE_ROTATE_MS, ROLES } from '../constants';
import { SocialLinks } from './social-links';

export function HeroSection() {
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRoleIndex((current) => (current + 1) % ROLES.length);
    }, ROLE_ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  function handleViewWork() {
    router.push('/projects');
  }

  return (
    <View style={styles.section}>
      <Reveal>
        <Text color="accent" role="label" style={styles.eyebrow}>
          {"Hey there, I'm"}
        </Text>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs}>
        <Text accessibilityRole="header" role="title" style={styles.name}>
          Mohamed Ghaly.
        </Text>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 2}>
        <Reveal key={roleIndex}>
          <Text color="textMuted" role="heading" style={styles.role}>
            {ROLES[roleIndex]}
          </Text>
        </Reveal>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 3}>
        <Text color="textMuted" role="body" style={styles.pitch}>
          I build cross-platform mobile apps and high-performance web interfaces.
          Focused on clean architecture, real-time features, and developer experience
          that scales.
        </Text>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 4}>
        <View style={styles.actions}>
          <Button label="View My Work →" onPress={handleViewWork} variant="primary" />
          <Button label="Download CV ↓" onPress={openCv} variant="ghost" />
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 5}>
        <SocialLinks />
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three,
    paddingVertical: Spacing.section,
  },
  eyebrow: {
    letterSpacing: 2,
  },
  name: {
    fontSize: 40,
    lineHeight: 48,
  },
  role: {
    fontSize: 22,
    lineHeight: 30,
  },
  pitch: {
    maxWidth: 480,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two + Spacing.half,
  },
});
