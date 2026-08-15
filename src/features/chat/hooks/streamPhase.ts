export type StreamPhase =
  | "submitted"
  | "connecting"
  | "retrieving"
  | "streaming"
  | "completed"
  | "stopped"
  | "failed";

export function deriveStreamPhase(input: {
  status: "submitted" | "streaming" | "ready" | "error";
  connected: boolean;
  activeToolLabel: string | null;
  lastTurnStopped: boolean;
  hasError: boolean;
}): StreamPhase {
  if (input.hasError || input.status === "error") return "failed";
  if (input.status === "submitted" && !input.connected) return "submitted";
  if (input.status === "submitted" && input.connected) return "connecting";
  if (input.status === "streaming" && input.activeToolLabel) return "retrieving";
  if (input.status === "streaming") return "streaming";
  if (input.status === "ready" && input.lastTurnStopped) return "stopped";
  return "completed";
}
