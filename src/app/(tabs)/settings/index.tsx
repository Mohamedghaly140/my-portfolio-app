import { StyleSheet, View } from 'react-native';

import { Button, Card, Screen, SectionLabel } from '@/components/ui';
import { Spacing } from '@/theme';
import { useThemePreference } from '@/theme/theme-preference-provider';

export default function SettingsScreen() {
  const { preference, setPreference } = useThemePreference();

  return (
    <Screen>
      <View style={styles.section}>
        <SectionLabel>APPEARANCE</SectionLabel>
        <Card>
          <View style={styles.buttonRow}>
            <Button
              label="System"
              onPress={() => {
                setPreference('system');
              }}
              variant={preference === 'system' ? 'primary' : 'ghost'}
            />
            <Button
              label="Light"
              onPress={() => {
                setPreference('light');
              }}
              variant={preference === 'light' ? 'primary' : 'ghost'}
            />
            <Button
              label="Dark"
              onPress={() => {
                setPreference('dark');
              }}
              variant={preference === 'dark' ? 'primary' : 'ghost'}
            />
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    padding: Spacing.three,
  },
});
