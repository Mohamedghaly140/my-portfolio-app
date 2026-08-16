import {
  Linking,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { Reveal, SectionLabel, Text } from '@/components/ui';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/data/contact';
import { Motion, Spacing, Typography } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

// Tracks the web repo's PRIVACY_NOTICE_VERSION env var; this screen is fully offline so there is no live value to read.
const noticeVersion = '2026-08-15';

const RETENTION_ROWS = [
  {
    label: 'Anonymous session',
    retention: '30 days (after last activity)',
  },
  {
    label: 'Non-lead chat transcript',
    retention: '90 days',
  },
  {
    label: 'Failed request diagnostics',
    retention: '14 days (redacted)',
  },
  {
    label: 'Lead and consent record',
    retention:
      '12 months (after closure or last contact, then contact details are erased)',
  },
  {
    label: 'Admin audit log',
    retention: '12 months (no message bodies)',
  },
] as const;

const PROCESSORS = [
  'Mohamed Ghaly — site owner; reviews leads and operates the admin dashboard.',
  'OpenAI — generates chat replies through the Responses API with store: false. Conversations are not used for training.',
  'Resend — delivers lead-notification email to Mohamed only. It is not used for marketing.',
] as const;

export function PrivacyScreen() {
  const { colors } = useTheme();

  function handleMailto() {
    void Linking.openURL(CONTACT_MAILTO);
  }

  function handleContactPage() {
    router.push('/(tabs)/contact');
  }

  return (
    <View style={styles.root}>
      <Reveal>
        <SectionLabel>Privacy</SectionLabel>
        <Text accessibilityRole="header" role="heading" style={styles.title}>
          What Mo Ghaly GPT collects — and for how long.
        </Text>
        <Text color="textMuted" role="body" style={styles.intro}>
          This notice covers the public chat on this site, lead forms submitted
          through it, and the admin tooling used to review those leads. Portfolio
          pages themselves do not require an account and do not store personal
          messages.
        </Text>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs}>
        <View style={styles.section}>
          <Text accessibilityRole="header" role="heading" style={styles.heading}>
            What is collected and why
          </Text>
          <View style={styles.paragraphs}>
            <Text color="textMuted" role="body">
              Chat messages are stored so a conversation can continue across
              refreshes and so Mohamed can review a lead in context. The same
              messages are sent to OpenAI to generate replies. This app may also
              cache a display copy of the transcript on-device for this session.
            </Text>
            <Text color="textMuted" role="body">
              When you submit a lead form, the site stores your contact details
              (encrypted), a conversation summary, and consent metadata so Mohamed
              can follow up. Admin notes on a lead are also encrypted.
            </Text>
            <Text color="textMuted" role="body">
              Aggregated, non-identifying operational metrics may be kept longer
              than any individual transcript.
            </Text>
          </View>
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 2}>
        <View style={styles.section}>
          <Text accessibilityRole="header" role="heading" style={styles.heading}>
            How long data is kept
          </Text>
          <View
            accessibilityLabel="Retention periods for Mo Ghaly GPT data categories"
            style={[styles.retentionList, { borderColor: colors.border }]}
          >
            {RETENTION_ROWS.map((row, index) => (
              <View
                key={row.label}
                style={[
                  styles.retentionRow,
                  index < RETENTION_ROWS.length - 1 && {
                    borderBottomColor: colors.border,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <Text role="body" style={styles.retentionLabel}>
                  {row.label}
                </Text>
                <Text color="textMuted" role="small" style={styles.retentionValue}>
                  {row.retention}
                </Text>
              </View>
            ))}
          </View>
          <Text color="textMuted" role="small" style={styles.footnote}>
            Rate-limit counters and related IP hashes are kept for 24 hours or
            less.
          </Text>
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 3}>
        <View style={styles.section}>
          <Text accessibilityRole="header" role="heading" style={styles.heading}>
            Where this applies
          </Text>
          <Text color="textMuted" role="body">
            This notice applies to every visitor, regardless of location. The site
            treats GDPR as the baseline for everyone — there is no separate
            geo-detection path — so the same retention and deletion promises hold
            worldwide.
          </Text>
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 4}>
        <View style={styles.section}>
          <Text accessibilityRole="header" role="heading" style={styles.heading}>
            Who processes the data
          </Text>
          <View style={styles.bullets}>
            {PROCESSORS.map((line) => (
              <Text key={line.slice(0, 24)} color="textMuted" role="body">
                • {line}
              </Text>
            ))}
          </View>
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 5}>
        <View style={styles.section}>
          <Text accessibilityRole="header" role="heading" style={styles.heading}>
            Request earlier deletion
          </Text>
          <RNText style={[Typography.body, { color: colors.textMuted }]}>
            {
              "You can ask Mohamed to delete a conversation or erase a lead's contact details before the scheduled retention window. Contact him at "
            }
            <RNText
              accessibilityRole="link"
              onPress={handleMailto}
              style={[Typography.body, { color: colors.accentText }]}
            >
              {CONTACT_EMAIL}
            </RNText>
            {' or use the '}
            <RNText
              accessibilityRole="link"
              onPress={handleContactPage}
              style={[Typography.body, { color: colors.accentText }]}
            >
              contact page
            </RNText>
            {
              ". On request, he can immediately erase a lead's stored contact details while keeping a non-identifying opportunity snapshot for review history."
            }
          </RNText>
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 6}>
        <Text color="textMuted" role="label" style={styles.footer}>
          Last updated · notice version {noticeVersion}
        </Text>
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingBottom: Spacing.four,
  },
  title: {
    marginBottom: Spacing.three,
    marginTop: Spacing.two + Spacing.half,
  },
  intro: {
    marginBottom: Spacing.five,
  },
  section: {
    marginBottom: Spacing.five,
  },
  heading: {
    fontSize: 20,
    lineHeight: 28,
    marginBottom: Spacing.three,
  },
  paragraphs: {
    gap: Spacing.three,
  },
  retentionList: {
    borderWidth: 1,
  },
  retentionRow: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
  },
  retentionLabel: {
    flexShrink: 1,
  },
  retentionValue: {
    flexShrink: 1,
  },
  footnote: {
    marginTop: Spacing.three,
  },
  bullets: {
    gap: Spacing.two + Spacing.half,
  },
  footer: {
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
