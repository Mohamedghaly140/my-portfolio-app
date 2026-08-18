import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Host } from '@expo/ui';
import {
  DropdownMenu,
  DropdownMenuItem,
  RNHostView,
} from '@expo/ui/jetpack-compose';

import { lightImpact } from '@/lib/haptics';
import type { ThemePreference } from '@/lib/preferences/theme';
import { useTheme } from '@/theme/theme-provider';
import { useThemePreference } from '@/theme/theme-preference-provider';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

type PreferenceIcon = keyof typeof Ionicons.glyphMap;

function triggerIconName(preference: ThemePreference): PreferenceIcon {
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

/** Icon-only Home header control that opens a native appearance menu. */
export function AppearanceMenuButton() {
  const { colors } = useTheme();
  const { preference, setPreference } = useThemePreference();
  const [expanded, setExpanded] = useState(false);

  function openMenu() {
    lightImpact();
    setExpanded(true);
  }

  return (
    <Host matchContents style={styles.host}>
      <DropdownMenu
        expanded={expanded}
        onDismissRequest={() => {
          setExpanded(false);
        }}
      >
        <DropdownMenu.Trigger>
          <RNHostView matchContents>
            <Pressable
              accessibilityLabel="Appearance"
              accessibilityRole="button"
              hitSlop={8}
              onPress={openMenu}
              style={styles.button}
            >
              <Ionicons
                color={colors.accentText}
                name={triggerIconName(preference)}
                size={22}
              />
            </Pressable>
          </RNHostView>
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>
          {OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => {
                setPreference(option.value);
                setExpanded(false);
              }}
            >
              {preference === option.value ? (
                <DropdownMenuItem.LeadingIcon>
                  <RNHostView matchContents>
                    <Ionicons
                      color={colors.accentText}
                      name="checkmark"
                      size={18}
                    />
                  </RNHostView>
                </DropdownMenuItem.LeadingIcon>
              ) : null}
              <DropdownMenuItem.Text>{option.label}</DropdownMenuItem.Text>
            </DropdownMenuItem>
          ))}
        </DropdownMenu.Items>
      </DropdownMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    height: 44,
    width: 44,
  },
  button: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
