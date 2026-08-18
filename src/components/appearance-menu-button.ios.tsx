import { StyleSheet, View } from 'react-native';
import { Host } from '@expo/ui';
import { Button, Menu } from '@expo/ui/swift-ui';
import { labelStyle } from '@expo/ui/swift-ui/modifiers';

import { lightImpact } from '@/lib/haptics';
import type { ThemePreference } from '@/lib/preferences/theme';
import { useThemePreference } from '@/theme/theme-preference-provider';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

function triggerSystemImage(preference: ThemePreference): string {
  switch (preference) {
    case 'light':
      return 'sun.max';
    case 'dark':
      return 'moon';
    case 'system':
    default:
      return 'gearshape';
  }
}

/** Icon-only Home header control that opens a native appearance menu. */
export function AppearanceMenuButton() {
  const { preference, setPreference } = useThemePreference();

  return (
    <View onTouchStart={lightImpact} style={styles.button}>
      <Host matchContents style={styles.host}>
        <Menu
          label="Appearance"
          modifiers={[labelStyle('iconOnly')]}
          systemImage={triggerSystemImage(preference)}
        >
          {OPTIONS.map((option) => (
            <Button
              key={option.value}
              label={option.label}
              onPress={() => {
                setPreference(option.value);
              }}
              {...(preference === option.value
                ? { systemImage: 'checkmark' }
                : {})}
            />
          ))}
        </Menu>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  host: {
    height: 44,
    width: 44,
  },
});
