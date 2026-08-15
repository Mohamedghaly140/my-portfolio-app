import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Motion } from '@/theme';
import { useTheme } from '@/theme/theme-provider';

export type SkeletonProps = {
  width: number | `${number}%`;
  height: number;
};

export function Skeleton({ width, height }: SkeletonProps) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(reducedMotion ? 0.4 : 1);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 0.4;
      return;
    }

    opacity.value = withRepeat(
      withTiming(0.4, {
        duration: Motion.entranceMs,
        easing: Motion.easing,
      }),
      -1,
      true,
    );
  }, [opacity, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const styles = StyleSheet.create({
    root: {
      backgroundColor: colors.border,
      height,
      width,
    },
  });

  return <Animated.View style={[styles.root, animatedStyle]} />;
}
