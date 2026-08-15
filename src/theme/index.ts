import { Colors, type ColorSchemeName, type ThemeColors } from './colors';
import { Motion } from './motion';
import { Spacing } from './spacing';
import { Typography } from './typography';

export type AppTheme = {
  scheme: ColorSchemeName;
  colors: ThemeColors;
  typography: typeof Typography;
  spacing: typeof Spacing;
  motion: typeof Motion;
  radius: 0;
};

const themes: Record<ColorSchemeName, AppTheme> = {
  dark: {
    scheme: 'dark',
    colors: Colors.dark,
    typography: Typography,
    spacing: Spacing,
    motion: Motion,
    radius: 0,
  },
  light: {
    scheme: 'light',
    colors: Colors.light,
    typography: Typography,
    spacing: Spacing,
    motion: Motion,
    radius: 0,
  },
};

export function getTheme(scheme: ColorSchemeName): AppTheme {
  return themes[scheme];
}

export type { ColorSchemeName, ThemeColors } from './colors';
export { Colors } from './colors';
export { fontAssets } from './fonts';
export { Motion } from './motion';
export { BottomTabInset, MaxContentWidth, Spacing } from './spacing';
export { FontFamilies, Typography, type TypeRole, type TypeStyle } from './typography';
