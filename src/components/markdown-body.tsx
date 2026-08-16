import { type ReactNode } from 'react';
import { Linking, StyleSheet, Text as RNText, View } from 'react-native';

import { Text } from '@/components/ui';
import { FontFamilies, Spacing, Typography } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type MarkdownBodyProps = {
  markdown: string;
};

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; text: string };

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i += 1;
      continue;
    }

    if (line.startsWith('```')) {
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ type: 'code', text: codeLines.join('\n') });
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, '').trim());
        i += 1;
      }
      blocks.push({ type: 'list', items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,6}\s+/.test(lines[i]) &&
      !lines[i].startsWith('```') &&
      !/^[-*]\s+/.test(lines[i])
    ) {
      paragraphLines.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') });
  }

  return blocks;
}

function renderInline(
  text: string,
  linkColors: { code: string; accent: string },
): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|_[^_]+_)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <RNText key={key} style={styles.bold}>
          {token.slice(2, -2)}
        </RNText>,
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <RNText key={key} style={[styles.inlineCode, { color: linkColors.code }]}>
          {token.slice(1, -1)}
        </RNText>,
      );
    } else if (token.startsWith('[')) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        const [, linkText, url] = linkMatch;
        nodes.push(
          <RNText
            key={key}
            onPress={() => void Linking.openURL(url)}
            style={[styles.link, { color: linkColors.accent }]}
          >
            {linkText}
          </RNText>,
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith('_') && token.endsWith('_')) {
      nodes.push(
        <RNText key={key} style={styles.italic}>
          {token.slice(1, -1)}
        </RNText>,
      );
    } else {
      nodes.push(token);
    }

    key += 1;
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function MarkdownBody({ markdown }: MarkdownBodyProps) {
  const { colors } = useTheme();
  const blocks = parseBlocks(markdown);
  const linkColors = { code: colors.code, accent: colors.accentText };

  return (
    <View style={styles.root}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return (
              <Text
                key={index}
                role={block.level <= 1 ? 'heading' : 'subheading'}
                style={styles.heading}
              >
                {block.text}
              </Text>
            );
          case 'paragraph':
            return (
              <Text key={index} role="body" style={styles.paragraph}>
                {renderInline(block.text, linkColors)}
              </Text>
            );
          case 'list':
            return (
              <View key={index} style={styles.list}>
                {block.items.map((item, itemIndex) => (
                  <Text key={itemIndex} role="body" style={styles.listItem}>
                    {'• '}
                    {renderInline(item, linkColors)}
                  </Text>
                ))}
              </View>
            );
          case 'code':
            return (
              <View
                key={index}
                style={[
                  styles.codeBlock,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <RNText style={[styles.codeText, { color: colors.code }]}>
                  {block.text}
                </RNText>
              </View>
            );
          default:
            return null;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.three,
  },
  heading: {
    marginTop: Spacing.two,
  },
  paragraph: {},
  list: {
    gap: Spacing.one,
  },
  listItem: {},
  codeBlock: {
    borderWidth: 1,
    padding: Spacing.three,
  },
  codeText: {
    ...Typography.code,
  },
  bold: {
    fontFamily: FontFamilies.bodyBold,
  },
  italic: {
    fontStyle: 'italic',
  },
  link: {
    textDecorationLine: 'underline',
  },
  inlineCode: {
    fontFamily: FontFamilies.code,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
  },
});
