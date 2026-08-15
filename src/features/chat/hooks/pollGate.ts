import type { AppStateStatus } from "react-native";

export function shouldPoll(input: {
  hasActiveGeneration: boolean;
  localStreamActive: boolean;
  appState: AppStateStatus;
}): boolean {
  return input.hasActiveGeneration && !input.localStreamActive && input.appState === "active";
}
