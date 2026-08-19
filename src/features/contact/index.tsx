import { StyleSheet, View } from "react-native";

import { AskMohamedCTA } from "@/components/ask-mohamed-cta";
import { Reveal, SectionLabel, Text } from "@/components/ui";
import { Spacing } from "@/theme";

import { AppearanceMenuButton } from "@/components/appearance-menu-button";
import { PrivacyHeaderButton } from "@/components/privacy-header-button";
import { useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { ContactForm } from "./components/ContactForm";
import { ContactLinks } from "./components/ContactLinks";

export function ContactScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <AppearanceMenuButton />,
      headerRight: () => <PrivacyHeaderButton />,
    });
  }, [navigation]);

  return (
    <View style={styles.root}>
      <Reveal>
        <SectionLabel>Contact</SectionLabel>
        <Text accessibilityRole="header" role="heading" style={styles.title}>
          {"Let's Work Together"}
        </Text>
        <Text color="textMuted" role="body" style={styles.supporting}>
          Open to senior Flutter / frontend roles, freelance contracts, and
          interesting collaborations. I respond within 24 hours.
        </Text>
      </Reveal>

      <ContactForm />
      <ContactLinks />
      <AskMohamedCTA variant="inline" />
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
});
