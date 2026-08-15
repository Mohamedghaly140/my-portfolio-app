import { MESSAGE_MAX_LENGTH } from "./config";

export function parseSeedQuestion(raw: string | undefined): string | null {
  if (!raw) return null;
  const normalized = raw.normalize("NFC").trim();
  if (normalized.length < 1 || normalized.length > MESSAGE_MAX_LENGTH) return null;
  return normalized;
}
