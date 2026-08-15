import { StyleSheet, View } from 'react-native';

import { Reveal } from '@/components/ui';
import type { ExperienceItem } from '@/types/experience';
import { Motion } from '@/theme';

import { TimelineItem } from './timeline-item';

export type TimelineProps = {
  items: ExperienceItem[];
};

export function Timeline({ items }: TimelineProps) {
  return (
    <View style={styles.root}>
      {items.map((item, index) => (
        <Reveal
          key={`${item.company}-${item.period}`}
          delayMs={index * Motion.staggerMs}
        >
          <TimelineItem isLast={index === items.length - 1} item={item} />
        </Reveal>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
  },
});
