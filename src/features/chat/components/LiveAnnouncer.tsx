import { useEffect, useRef } from "react";
import { AccessibilityInfo } from "react-native";

import type { StreamPhase } from "@/features/chat/hooks/streamPhase";

export type LiveAnnouncerProps = {
  phase: StreamPhase;
  errorMessage?: string | null;
  activeToolLabel?: string | null;
};

function announcementFor(
  phase: StreamPhase,
  errorMessage?: string | null,
  activeToolLabel?: string | null,
): string | null {
  switch (phase) {
    case "submitted":
    case "connecting":
      return "Connecting to Mo Ghaly GPT.";
    case "retrieving":
      return activeToolLabel ?? "Mo Ghaly GPT is retrieving information.";
    case "streaming":
      return "Mo Ghaly GPT is typing.";
    case "completed":
      return "Reply complete.";
    case "stopped":
      return "Response stopped. The answer is incomplete.";
    case "failed":
      return errorMessage ?? null;
  }
}

export function LiveAnnouncer({
  phase,
  errorMessage,
  activeToolLabel,
}: LiveAnnouncerProps) {
  const previousRef = useRef<string | null>(null);

  useEffect(() => {
    const next = announcementFor(phase, errorMessage, activeToolLabel);
    if (next === null || next === previousRef.current) return;
    previousRef.current = next;
    AccessibilityInfo.announceForAccessibility(next);
  }, [activeToolLabel, errorMessage, phase]);

  return null;
}
