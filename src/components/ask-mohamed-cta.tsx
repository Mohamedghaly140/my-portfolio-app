import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Button, PromptChip, Reveal, SectionLabel, Text } from '@/components/ui';
import { SUGGESTED_PROMPTS } from '@/features/home/constants';
import { Motion, Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type AskMohamedCTAProps = {
  variant?: 'banner' | 'compact';
};

const BANNER_PROMPTS = SUGGESTED_PROMPTS.slice(0, 4);
const COMPACT_PROMPTS = SUGGESTED_PROMPTS.slice(0, 3);
const DEFAULT_PROMPT = SUGGESTED_PROMPTS[0];

function openChatWithPrompt(prompt: string) {
  router.push({
    pathname: '/(chat)',
    params: { q: prompt },
  });
}

export function AskMohamedCTA({ variant = 'banner' }: AskMohamedCTAProps) {
  if (variant === 'compact') {
    return <CompactCTA />;
  }

  return <BannerCTA />;
}

function BannerCTA() {
  const { colors } = useTheme();

  function handleCta() {
    openChatWithPrompt(DEFAULT_PROMPT);
  }

  return (
    <View style={[styles.bannerSection, { backgroundColor: colors.surface }]}>
      <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />

      <Reveal>
        <View style={styles.bannerHeader}>
          <SectionLabel>Ask Mohamed</SectionLabel>
          <Text accessibilityRole="header" role="heading" style={styles.bannerTitle}>
            Curious about my work?
          </Text>
          <Text color="textMuted" role="body" style={styles.bannerBody}>
            Ask Mo Ghaly GPT about my experience, projects, or approach to building
            production software.
          </Text>
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs}>
        <View style={styles.bannerCta}>
          <Button
            icon={{ name: 'arrow-forward' }}
            label="Ask Mo Ghaly GPT"
            onPress={handleCta}
            variant="primary"
          />
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 2}>
        <View style={styles.bannerChips}>
          {BANNER_PROMPTS.map((prompt) => (
            <PromptChip
              key={prompt}
              label={prompt}
              onPress={() => {
                openChatWithPrompt(prompt);
              }}
            />
          ))}
        </View>
      </Reveal>
    </View>
  );
}

function CompactCTA() {
  function handleCta() {
    openChatWithPrompt(DEFAULT_PROMPT);
  }

  return (
    <View style={styles.compactSection}>
      <Reveal>
        <View style={styles.compactHeader}>
          <SectionLabel>Ask Mohamed</SectionLabel>
          <Text accessibilityRole="header" role="heading" style={styles.compactTitle}>
            Have a question about my work?
          </Text>
          <Text color="textMuted" role="body">
            Mo Ghaly GPT can answer questions about my experience, projects, and
            engineering approach.
          </Text>
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs}>
        <View style={styles.compactCta}>
          <Button
            icon={{ name: 'arrow-forward' }}
            label="Ask Mo Ghaly GPT"
            onPress={handleCta}
            variant="primary"
          />
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 2}>
        <View style={styles.compactChips}>
          {COMPACT_PROMPTS.map((prompt) => (
            <PromptChip
              key={prompt}
              label={prompt}
              onPress={() => {
                openChatWithPrompt(prompt);
              }}
            />
          ))}
        </View>
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerSection: {
    marginHorizontal: -Spacing.gutter,
    paddingHorizontal: Spacing.gutter,
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
  bannerHeader: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  bannerTitle: {
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
  },
  bannerBody: {
    marginBottom: Spacing.two,
    maxWidth: 560,
    textAlign: 'center',
  },
  bannerCta: {
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  bannerChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
  compactSection: {
    gap: Spacing.three,
    paddingVertical: Spacing.section,
  },
  compactHeader: {
    gap: Spacing.two,
  },
  compactTitle: {
    marginTop: Spacing.half,
  },
  compactCta: {
    alignItems: 'flex-start',
  },
  compactChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
