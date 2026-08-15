import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';

import { Badge, Divider, Reveal, Text } from '@/components/ui';
import { getProjectBySlug } from '@/data/projects';
import type { Project } from '@/types/project';
import { Motion, Spacing } from '@/theme';

type MetaLink = {
  label: string;
  href: string;
  linkText: string;
};

function buildMetaLinks(project: Project): MetaLink[] {
  const links: MetaLink[] = [];
  if (project.liveUrl) {
    links.push({ label: 'Live', href: project.liveUrl, linkText: 'View Site →' });
  }
  if (project.appstoreUrl) {
    links.push({
      label: 'App Store',
      href: project.appstoreUrl,
      linkText: 'Download →',
    });
  }
  if (project.playstoreUrl) {
    links.push({
      label: 'Play Store',
      href: project.playstoreUrl,
      linkText: 'Download →',
    });
  }
  if (project.githubUrl) {
    links.push({ label: 'Source', href: project.githubUrl, linkText: 'GitHub →' });
  }
  return links;
}

function MetaPair({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.metaPair}>
      <Text color="textMuted" role="label">
        {label}
      </Text>
      {children}
    </View>
  );
}

function MetaLinkPair({ label, href, linkText }: MetaLink) {
  function handlePress() {
    void Linking.openURL(href);
  }

  return (
    <MetaPair label={label}>
      <Pressable accessibilityRole="link" hitSlop={8} onPress={handlePress}>
        <Text color="accent" role="small">
          {linkText}
        </Text>
      </Pressable>
    </MetaPair>
  );
}

function ProjectNotFound() {
  function handleBack() {
    router.push('/projects');
  }

  return (
    <View style={styles.notFound}>
      <Text role="subheading">This project does not exist.</Text>
      <Pressable accessibilityRole="link" hitSlop={8} onPress={handleBack}>
        <Text color="textMuted" role="body">
          ← All Projects
        </Text>
      </Pressable>
    </View>
  );
}

export function ProjectDetailScreen() {
  const { slug: slugParam } = useLocalSearchParams<{ slug: string }>();
  const slug = typeof slugParam === 'string' ? slugParam : slugParam?.[0];
  const project = slug ? getProjectBySlug(slug) : undefined;

  if (!project) {
    return <ProjectNotFound />;
  }

  const metaLinks = buildMetaLinks(project);

  function handleBack() {
    router.push('/projects');
  }

  return (
    <View style={styles.root}>
      <Reveal>
        <Pressable accessibilityRole="link" hitSlop={8} onPress={handleBack}>
          <Text color="accent" role="small">
            ← All Projects
          </Text>
        </Pressable>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs}>
        <View style={styles.header}>
          <Badge label={project.category} variant="muted" />
          <Text accessibilityRole="header" role="heading" style={styles.title}>
            {project.title}
          </Text>
          <Text color="textMuted" role="body">
            {project.description}
          </Text>
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 2}>
        <View style={styles.metaRow}>
          <MetaPair label="Year">
            <Text role="small">{String(project.year)}</Text>
          </MetaPair>

          {project.company ? (
            <MetaPair label="Company">
              <Text role="small">{project.company}</Text>
            </MetaPair>
          ) : null}

          <MetaPair label="Status">
            <Text color="accent" role="small">
              {project.status}
            </Text>
          </MetaPair>

          {metaLinks.map((link) => (
            <MetaLinkPair key={link.label} {...link} />
          ))}
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 3}>
        <View style={styles.tags}>
          {project.tags.map((tag) => (
            <Badge key={tag} label={tag} variant="code" />
          ))}
        </View>
      </Reveal>

      <Reveal delayMs={Motion.staggerMs * 4}>
        <View style={styles.body}>
          <Divider />
          {/* Full MDX case-study body deferred to M7/M8; description is the offline body for now. */}
          <Text role="body" style={styles.bodyText}>
            {project.description}
          </Text>
        </View>
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.four,
    paddingBottom: Spacing.four,
    paddingTop: Spacing.two,
  },
  header: {
    gap: Spacing.two + Spacing.half,
  },
  title: {
    marginTop: Spacing.one,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  metaPair: {
    gap: Spacing.one,
    minWidth: 120,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  body: {
    gap: Spacing.four,
  },
  bodyText: {
    marginTop: Spacing.one,
  },
  notFound: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.three,
    justifyContent: 'center',
    padding: Spacing.four,
  },
});
