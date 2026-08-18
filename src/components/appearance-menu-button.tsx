import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card } from '@/components/ui';
import { lightImpact } from '@/lib/haptics';
import type { ThemePreference } from '@/lib/preferences/theme';
import { Spacing } from '@/theme';
import { useTheme } from '@/theme/theme-provider';
import { useThemePreference } from '@/theme/theme-preference-provider';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

function triggerIconName(
  preference: ThemePreference,
): React.ComponentProps<typeof Ionicons>['name'] {
  switch (preference) {
    case 'light':
      return 'sunny-outline';
    case 'dark':
      return 'moon-outline';
    case 'system':
    default:
      return 'settings-outline';
  }
}

/**
 * Plain-RN fallback for web (Metro resolves `.ios.tsx` / `.android.tsx` on
 * device). No `@expo/ui` native menu is available here, so this renders its
 * own popover with the same three options.
 */
export function AppearanceMenuButton() {
  const { colors } = useTheme();
  const { preference, setPreference } = useThemePreference();
  const [open, setOpen] = useState(false);

  function toggleOpen() {
    lightImpact();
    setOpen((value) => !value);
  }

  function selectPreference(value: ThemePreference) {
    setPreference(value);
    setOpen(false);
  }

  return (
    <View>
      <Pressable
        accessibilityLabel="Appearance"
        accessibilityRole="button"
        hitSlop={8}
        onPress={toggleOpen}
        style={styles.trigger}
      >
        <Ionicons
          color={colors.accentText}
          name={triggerIconName(preference)}
          size={22}
        />
      </Pressable>
      {open ? (
        <Card style={styles.menu}>
          {OPTIONS.map((option) => (
            <Button
              key={option.value}
              label={option.label}
              onPress={() => {
                selectPreference(option.value);
              }}
              variant={preference === option.value ? 'primary' : 'ghost'}
            />
          ))}
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  menu: {
    position: 'absolute',
    top: 44,
    right: 0,
    gap: Spacing.one,
    minWidth: 160,
    padding: Spacing.two,
    zIndex: 10,
  },
});
