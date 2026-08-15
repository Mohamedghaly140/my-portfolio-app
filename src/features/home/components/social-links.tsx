import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Linking from 'expo-linking';

import {
  CONTACT_MAILTO,
  CONTACT_TEL,
  CONTACT_WHATSAPP,
} from '@/data/contact';
import { Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

import { isConfiguredHttpUrl } from '../is-configured-http-url';

const ICON_SIZE = 20;

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type SocialLinkItem = {
  href: string;
  icon: IoniconName;
  label: string;
};

type CatalogItem = {
  href: string | undefined;
  icon: IoniconName;
  label: string;
  requireHttp?: boolean;
};

function resolveHref(item: CatalogItem): string | undefined {
  if (item.requireHttp) {
    return isConfiguredHttpUrl(item.href) ? item.href : undefined;
  }
  return item.href;
}

function getSocialLinks(): SocialLinkItem[] {
  const catalog: CatalogItem[] = [
    {
      href: process.env.EXPO_PUBLIC_GITHUB_URL,
      icon: 'logo-github',
      label: 'GitHub',
      requireHttp: true,
    },
    {
      href: process.env.EXPO_PUBLIC_LINKEDIN_URL,
      icon: 'logo-linkedin',
      label: 'LinkedIn',
      requireHttp: true,
    },
    {
      href: process.env.EXPO_PUBLIC_YOUTUBE_URL,
      icon: 'logo-youtube',
      label: 'YouTube',
      requireHttp: true,
    },
    { href: CONTACT_MAILTO, icon: 'mail-outline', label: 'Email' },
    { href: CONTACT_TEL, icon: 'call-outline', label: 'Phone' },
    { href: CONTACT_WHATSAPP, icon: 'logo-whatsapp', label: 'WhatsApp' },
  ];

  return catalog.flatMap((item) => {
    const href = resolveHref(item);
    return href ? [{ href, icon: item.icon, label: item.label }] : [];
  });
}

function SocialIconButton({ href, icon, label }: SocialLinkItem) {
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
      style={styles.hit}
    >
      {({ pressed }) => (
        <Ionicons
          color={pressed ? colors.accentText : colors.textMuted}
          name={icon}
          size={ICON_SIZE}
        />
      )}
    </Pressable>
  );
}

export function SocialLinks() {
  const links = getSocialLinks();

  return (
    <View style={styles.row}>
      {links.map((link) => (
        <SocialIconButton key={link.label} href={link.href} icon={link.icon} label={link.label} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  hit: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
});
