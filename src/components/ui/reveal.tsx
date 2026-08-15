import Animated, {
  FadeInDown,
  useReducedMotion,
} from 'react-native-reanimated';
import { View } from 'react-native';

import { Motion } from '@/theme';

export type RevealProps = {
  children: React.ReactNode;
  delayMs?: number;
};

export function Reveal({ children, delayMs = 0 }: RevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <View>{children}</View>;
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(Motion.entranceMs)
        .delay(delayMs)
        .easing(Motion.easing)
        .withInitialValues({
          transform: [{ translateY: Motion.entranceOffsetY }],
        })}
    >
      {children}
    </Animated.View>
  );
}
