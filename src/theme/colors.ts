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
  onAccent: string; // label/icon colour for content on a solid `accent` fill
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
    onAccent: '#0A0A0F', // == bg; 11.96:1 on accent
  },
  light: {
    bg: '#F1F0EB',
    surface: '#FFFFFF',
    border: '#D6D3CA',
    borderPressed: '#BDBAB1',
    text: '#14141A',
    textMuted: '#454A52',
    accent: '#00E5A0',
    accentText: '#006E4D',
    accentDim: 'rgba(0, 110, 77, 0.10)',
    accentBorder: 'rgba(0, 110, 77, 0.2)',
    code: '#8A5A00',
    onAccent: '#14141A', // == text; 11.11:1 on accent (bg would be ~1.45:1)
  },
};
