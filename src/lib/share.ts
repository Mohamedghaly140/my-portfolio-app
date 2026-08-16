import { Share } from 'react-native';

function siteUrl(): string | undefined {
  return process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '');
}

/** Opens the native share sheet for a project's canonical web URL. */
export function shareProject(slug: string): void {
  const origin = siteUrl();
  if (!origin) {
    return;
  }
  const url = `${origin}/projects/${slug}`;
  void Share.share({ message: url, url }).catch(() => {});
}

/** Opens the native share sheet for a blog post's canonical web URL. */
export function shareBlogPost(slug: string): void {
  const origin = siteUrl();
  if (!origin) {
    return;
  }
  const url = `${origin}/blog/${slug}`;
  void Share.share({ message: url, url }).catch(() => {});
}
