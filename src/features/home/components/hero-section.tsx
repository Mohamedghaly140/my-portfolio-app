import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { SymbolView } from 'expo-symbols';

import { Button, Reveal, Text } from '@/components/ui';
import {
  CONTACT_MAILTO,
  CONTACT_TEL,
  CONTACT_WHATSAPP,
} from '@/data/contact';
import { Motion, Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

import { ROLE_ROTATE_MS, ROLES } from '../constants';
import { openCv } from '../open-cv';

function isConfiguredHttpUrl(value: string | undefined): value is string {
  if (!value) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

type SocialLinkProps = {
  label: string;
  href: string;
  children: React.ReactNode;
};

function SocialLink({ label, href, children }: SocialLinkProps) {
  const { colors } = useTheme();

  function handlePress() {
    void Linking.openURL(href);
  }

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="link"
      hitSlop={8}
      onPress={handlePress}
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
    >
      <View style={[styles.socialHit, { borderColor: colors.border }]}>{children}</View>
    </Pressable>
  );
}

function BrandGlyph({ label }: { label: string }) {
  return (
    <Text color="textMuted" role="small">
      {label}
    </Text>
  );
}

export function HeroSection() {
  const { colors } = useTheme();
  const [roleIndex, setRoleIndex] = useState(0);

  const githubUrl = process.env.EXPO_PUBLIC_GITHUB_URL;
  const linkedinUrl = process.env.EXPO_PUBLIC_LINKEDIN_URL;
  const youtubeUrl = process.env.EXPO_PUBLIC_YOUTUBE_URL;

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
        <View style={styles.socialRow}>
          {isConfiguredHttpUrl(githubUrl) ? (
            <SocialLink href={githubUrl} label="GitHub">
              <BrandGlyph label="GH" />
            </SocialLink>
          ) : null}
          {isConfiguredHttpUrl(linkedinUrl) ? (
            <SocialLink href={linkedinUrl} label="LinkedIn">
              <BrandGlyph label="in" />
            </SocialLink>
          ) : null}
          {isConfiguredHttpUrl(youtubeUrl) ? (
            <SocialLink href={youtubeUrl} label="YouTube">
              <BrandGlyph label="YT" />
            </SocialLink>
          ) : null}
          <SocialLink href={CONTACT_MAILTO} label="Email">
            <SymbolView
              name={{ ios: 'envelope', android: 'mail', web: 'mail' }}
              size={20}
              tintColor={colors.textMuted}
            />
          </SocialLink>
          <SocialLink href={CONTACT_TEL} label="Phone">
            <SymbolView
              name={{ ios: 'phone', android: 'call', web: 'call' }}
              size={20}
              tintColor={colors.textMuted}
            />
          </SocialLink>
          <SocialLink href={CONTACT_WHATSAPP} label="WhatsApp">
            <SymbolView
              name={{ ios: 'message', android: 'chat', web: 'chat' }}
              size={20}
              tintColor={colors.textMuted}
            />
          </SocialLink>
        </View>
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
  socialRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  socialHit: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
});
