import { useCallback, useState } from "react";
import { storage } from "@/lib/storage/mmkv";
import {
  type CachedTranscript,
  evictOverflow,
} from "./transcriptCacheLogic";

const CACHE_KEY = "mg_chat_transcript";
const SAVE_DEBOUNCE_MS = 250;

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSave: CachedTranscript | null = null;

function parseCached(raw: string | undefined): CachedTranscript | null {
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as CachedTranscript;
  } catch {
    return null;
  }
}

function readCached(): CachedTranscript | null {
  return parseCached(storage.getString(CACHE_KEY));
}

/** Resolves with the persisted transcript, if any. Kept async for API compatibility with existing callers. */
export async function waitForTranscriptCache(): Promise<CachedTranscript | null> {
  return readCached();
}

export function writeDebounced(transcript: CachedTranscript): void {
  pendingSave = {
    ...transcript,
    messages: evictOverflow(transcript.messages),
  };
  if (saveTimer !== null) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const next = pendingSave;
    saveTimer = null;
    pendingSave = null;
    if (!next) return;
    storage.set(CACHE_KEY, JSON.stringify(next));
  }, SAVE_DEBOUNCE_MS);
}

export function useTranscriptCache(): {
  cached: CachedTranscript | null;
  save: (t: CachedTranscript) => void;
} {
  const [cached] = useState<CachedTranscript | null>(readCached);

  const save = useCallback((t: CachedTranscript): void => {
    writeDebounced(t);
  }, []);

  return { cached, save };
}
