import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';

import {
  Badge,
  Button,
  Card,
  Divider,
  PromptChip,
  Reveal,
  Screen,
  SectionLabel,
  Skeleton,
  Text,
} from '@/components/ui';
import { type ColorSchemeName, FontFamilies, Spacing } from '@/theme';
import { AppThemeProvider, useTheme } from '@/theme/theme-provider';

const TEXT_ROLES = [
  'title',
  'heading',
  'subheading',
  'body',
  'bodyMedium',
  'small',
  'label',
  'code',
] as const;

function GalleryContent({
  scheme,
  onToggleScheme,
}: {
  scheme: ColorSchemeName;
  onToggleScheme: () => void;
}) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    section: {
      gap: Spacing.two,
      paddingVertical: Spacing.three,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    cardBody: {
      gap: Spacing.two,
      padding: Spacing.three,
    },
    toggle: {
      alignItems: 'center',
      borderColor: colors.border,
      borderWidth: 1,
      minHeight: 44,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
    },
    toggleLabel: {
      color: colors.accentText,
      fontFamily: FontFamilies.displayBold,
      fontSize: 14,
      lineHeight: 20,
    },
  });

  return (
    <Screen>
      <View style={styles.section}>
        <SectionLabel>Scheme</SectionLabel>
        <Text role="body">
          Active palette: {scheme}. Toggle is independent of system appearance.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onToggleScheme}
          style={styles.toggle}
        >
          <Text style={styles.toggleLabel}>
            Switch to {scheme === 'dark' ? 'light' : 'dark'}
          </Text>
        </Pressable>
      </View>

      <Divider />

      <View style={styles.section}>
        <SectionLabel>Text roles</SectionLabel>
        {TEXT_ROLES.map((role) => (
          <Text key={role} role={role}>
            {role} — The quick brown fox
          </Text>
        ))}
        <Text color="accent">accent → accentText</Text>
        <Text color="textMuted">textMuted</Text>
        <Text color="code">code</Text>
      </View>

      <Divider />

      <View style={styles.section}>
        <SectionLabel>Badge</SectionLabel>
        <View style={styles.row}>
          <Badge label="accent" variant="accent" />
          <Badge label="muted" variant="muted" />
          <Badge label="code" variant="code" />
        </View>
      </View>

      <Divider />

      <View style={styles.section}>
        <SectionLabel>Button</SectionLabel>
        <View style={styles.row}>
          <Button label="Primary" variant="primary" onPress={() => {}} />
          <Button label="Ghost" variant="ghost" onPress={() => {}} />
          <Button label="Disabled" disabled onPress={() => {}} />
          <Button label="Loading" loading onPress={() => {}} />
        </View>
      </View>

      <Divider />

      <View style={styles.section}>
        <SectionLabel>Card</SectionLabel>
        <Card onPress={() => {}}>
          <View style={styles.cardBody}>
            <Text role="subheading">Pressable card</Text>
            <Text color="textMuted">
              Border switches to borderPressed while pressed.
            </Text>
          </View>
        </Card>
      </View>

      <Divider />

      <View style={styles.section}>
        <SectionLabel>PromptChip</SectionLabel>
        <PromptChip label="Ask about Orth" onPress={() => {}} />
      </View>

      <Divider />

      <View style={styles.section}>
        <SectionLabel>Divider</SectionLabel>
        <Text color="textMuted">Full-bleed above; inset below.</Text>
        <Divider inset />
      </View>

      <Divider />

      <View style={styles.section}>
        <SectionLabel>Skeleton</SectionLabel>
        <Skeleton width="100%" height={16} />
        <Skeleton width={180} height={16} />
      </View>

      <Divider />

      <View style={styles.section}>
        <SectionLabel>Reveal</SectionLabel>
        <Reveal>
          <Text role="body">Fades in and rises 20px on enter.</Text>
        </Reveal>
      </View>
    </Screen>
  );
}

export default function TokenGalleryScreen() {
  const [scheme, setScheme] = useState<ColorSchemeName>('dark');

  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  function handleToggleScheme() {
    setScheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  return (
    <AppThemeProvider scheme={scheme}>
      <GalleryContent scheme={scheme} onToggleScheme={handleToggleScheme} />
    </AppThemeProvider>
  );
}
