import { Easing } from 'react-native-reanimated';

export const Motion = {
  easing: Easing.bezier(0.16, 1, 0.3, 1),
  entranceMs: 600,
  entranceOffsetY: 20,
  staggerMs: 55,
  pressMs: 150,
} as const;
