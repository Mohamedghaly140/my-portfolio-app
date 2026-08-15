import * as Linking from 'expo-linking';

/** Opens the site CV path. Shared by Hero and CTABanner. */
export function openCv(): void {
  const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (!siteUrl) {
    return;
  }
  void Linking.openURL(`${siteUrl}/cv/mohamed-ghaly-cv.pdf`);
}
