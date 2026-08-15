import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  type CachedTranscript,
  evictOverflow,
} from "./transcriptCacheLogic";

const CACHE_KEY = "mg_chat_transcript";
const SAVE_DEBOUNCE_MS = 250;

type CacheListener = () => void;

let memoryCached: CachedTranscript | null = null;
let hydrated = false;
let hydratePromise: Promise<CachedTranscript | null> | null = null;
const listeners = new Set<CacheListener>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSave: CachedTranscript | null = null;

function notify(): void {
  for (const listener of listeners) listener();
}

function parseCached(raw: string | null): CachedTranscript | null {
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as CachedTranscript;
  } catch {
    return null;
  }
}

/** Resolves once the initial AsyncStorage read has finished (shared across hook instances). */
export function waitForTranscriptCache(): Promise<CachedTranscript | null> {
  if (hydrated) return Promise.resolve(memoryCached);
  if (!hydratePromise) {
    hydratePromise = AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        memoryCached = parseCached(raw);
        hydrated = true;
        notify();
        return memoryCached;
      })
      .catch(() => {
        memoryCached = null;
        hydrated = true;
        notify();
        return null;
      });
  }
  return hydratePromise;
}

function writeDebounced(transcript: CachedTranscript): void {
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
    memoryCached = next;
    hydrated = true;
    notify();
    void AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next)).catch(() => {
      // Persistence is best-effort; in-memory cache still updated.
    });
  }, SAVE_DEBOUNCE_MS);
}

export function useTranscriptCache(): {
  cached: CachedTranscript | null;
  save: (t: CachedTranscript) => void;
} {
  const [cached, setCached] = useState<CachedTranscript | null>(memoryCached);

  useEffect(() => {
    const sync = (): void => {
      setCached(memoryCached);
    };
    listeners.add(sync);
    void waitForTranscriptCache().then(() => {
      sync();
    });
    return () => {
      listeners.delete(sync);
    };
  }, []);

  const save = useCallback((t: CachedTranscript): void => {
    writeDebounced(t);
  }, []);

  return { cached: hydrated ? cached : null, save };
}
