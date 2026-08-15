import * as Haptics from 'expo-haptics';

/** Light impact — primary button presses. */
export function lightImpact() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Selection change — card taps and similar navigations. */
export function selectionChanged() {
  void Haptics.selectionAsync();
}
