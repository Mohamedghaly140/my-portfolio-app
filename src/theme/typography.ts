export type TypeRole =
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodyMedium'
  | 'small'
  | 'label'
  | 'code';

export type TypeStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'uppercase';
};

export const FontFamilies = {
  display: 'SpaceMono_400Regular',
  displayBold: 'SpaceMono_700Bold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
  code: 'JetBrainsMono_400Regular',
} as const;

export const Typography: Record<TypeRole, TypeStyle> = {
  title: {
    fontFamily: FontFamilies.displayBold,
    fontSize: 36,
    lineHeight: 44,
  },
  heading: {
    fontFamily: FontFamilies.displayBold,
    fontSize: 24,
    lineHeight: 32,
  },
  subheading: {
    fontFamily: FontFamilies.displayBold,
    fontSize: 18,
    lineHeight: 26,
  },
  body: {
    fontFamily: FontFamilies.body,
    fontSize: 16,
    lineHeight: 26,
  },
  bodyMedium: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: 16,
    lineHeight: 26,
  },
  small: {
    fontFamily: FontFamilies.display,
    fontSize: 12,
    lineHeight: 18,
  },
  label: {
    fontFamily: FontFamilies.display,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  code: {
    fontFamily: FontFamilies.code,
    fontSize: 14,
    lineHeight: 22,
  },
};
