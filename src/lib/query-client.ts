import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import type { AppStateStatus } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient, focusManager, onlineManager } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { storage } from "@/lib/storage/mmkv";

const QUERY_CACHE_KEY = "mg_query_cache";
const QUERY_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

const mmkvStorageAdapter = {
  getItem: (key: string): string | null => storage.getString(key) ?? null,
  setItem: (key: string, value: string): void => {
    storage.set(key, value);
  },
  removeItem: (key: string): void => {
    storage.remove(key);
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: QUERY_CACHE_MAX_AGE,
    },
  },
});

/** Only markdown GETs may be written to MMKV — never session/chat keys. */
export function shouldDehydrateQuery(query: { queryKey: readonly unknown[] }): boolean {
  return query.queryKey[0] === "markdown";
}

export function setupOnlineManager(): void {
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });
  });
}

export function setupQueryPersistence(): void {
  if (Platform.OS === "web") return;

  persistQueryClient({
    queryClient,
    persister: createSyncStoragePersister({
      storage: mmkvStorageAdapter,
      key: QUERY_CACHE_KEY,
    }),
    dehydrateOptions: {
      shouldDehydrateQuery,
    },
    maxAge: QUERY_CACHE_MAX_AGE,
  });
}

export function isAppStateActive(status: AppStateStatus): boolean {
  return status === "active";
}

export function useQueryFocusManager(): void {
  useEffect(() => {
    if (Platform.OS === "web") return;

    const subscription = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(isAppStateActive(status));
    });

    return () => {
      subscription.remove();
    };
  }, []);
}
