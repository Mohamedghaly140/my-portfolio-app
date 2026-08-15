import { StyleSheet, View } from 'react-native';

import { Badge, Divider, Text } from '@/components/ui';
import type { SkillCategory as SkillCategoryType } from '@/types/skill';
import { Spacing } from '@/theme';

export type SkillCategoryProps = {
  category: SkillCategoryType;
};

export function SkillCategory({ category }: SkillCategoryProps) {
  return (
    <View style={styles.root}>
      <View style={styles.heading}>
        <Text color="accent" role="label">
          {category.category}
        </Text>
        <View style={styles.dividerGrow}>
          <Divider />
        </View>
      </View>

      <View style={styles.skills}>
        {category.skills.map((skill) => (
          <View key={skill.name} style={styles.skill}>
            <Badge label={skill.name} variant="accent" />
            {skill.level ? (
              <Text color="textMuted" role="small">
                {skill.level}
              </Text>
            ) : null}
          </View>
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
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  skill: {
    gap: Spacing.half,
  },
});
