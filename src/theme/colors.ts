export type ColorSchemeName = 'light' | 'dark';

export type ThemeColors = {
  bg: string;
  surface: string;
  border: string;
  borderPressed: string;
  text: string;
  textMuted: string;
  accent: string;
  accentText: string;
  accentDim: string;
  accentBorder: string;
  code: string;
};

export const Colors: Record<ColorSchemeName, ThemeColors> = {
  dark: {
    bg: '#0A0A0F',
    surface: '#111118',
    border: '#1E1E2E',
    borderPressed: '#2E2E48',
    text: '#F0EDE8',
    textMuted: '#9CA3AF',
    accent: '#00E5A0',
    accentText: '#00E5A0',
    accentDim: 'rgba(0, 229, 160, 0.082)',
    accentBorder: 'rgba(0, 229, 160, 0.2)',
    code: '#E2A84B',
  },
  light: {
    bg: '#FAFAF7',
    surface: '#FFFFFF',
    border: '#E4E2DC',
    borderPressed: '#C9C6BD',
    text: '#14141A',
    textMuted: '#5B6068',
    accent: '#00E5A0',
    accentText: '#00805A',
    accentDim: 'rgba(0, 128, 90, 0.10)',
    accentBorder: 'rgba(0, 128, 90, 0.2)',
    code: '#8A5A00',
  },
};
