import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Button, PromptChip, Reveal, SectionLabel, Text } from '@/components/ui';
import { Motion, Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

import { SUGGESTED_PROMPTS } from '../constants';

const BANNER_PROMPTS = SUGGESTED_PROMPTS.slice(0, 4);
const DEFAULT_PROMPT = SUGGESTED_PROMPTS[0];

function openChatWithPrompt(prompt: string) {
  router.push({
    pathname: '/(tabs)/(chat)',
    params: { q: prompt },
  });
}

export function AskMohamedCTA() {
  const { colors } = useTheme();

  function handleCta() {
    openChatWithPrompt(DEFAULT_PROMPT);
  }

  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />

      <Reveal>
        <View style={styles.header}>
          <SectionLabel>Ask Mohamed</SectionLabel>
          <Text accessibilityRole="header" role="heading" style={styles.title}>
            Curious about my work?
          </Text>
          <Text color="textMuted" role="body" style={styles.body}>
            Ask Mo Ghaly GPT about my experience, projects, or approach to building
            production software.
          </Text>
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs}>
        <View style={styles.cta}>
          <Button label="Ask Mo Ghaly GPT →" onPress={handleCta} variant="primary" />
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 2}>
        <View style={styles.chips}>
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

const styles = StyleSheet.create({
  section: {
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
    maxWidth: 560,
    textAlign: 'center',
  },
  cta: {
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
});
