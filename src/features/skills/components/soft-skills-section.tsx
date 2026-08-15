import { StyleSheet, View } from 'react-native';

import { Badge, Divider, Text } from '@/components/ui';
import { softSkills } from '@/data/skills';
import { Spacing } from '@/theme';

export function SoftSkillsSection() {
  return (
    <View style={styles.root}>
      <View style={styles.heading}>
        <Text color="accent" role="label">
          Soft Skills
        </Text>
        <View style={styles.dividerGrow}>
          <Divider />
        </View>
      </View>

      <View style={styles.badges}>
        {softSkills.map((skill) => (
          <Badge key={skill} label={skill} variant="muted" />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.three,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two + Spacing.half,
  },
  dividerGrow: {
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
