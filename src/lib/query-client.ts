import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import type { AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, focusManager, onlineManager } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

const QUERY_CACHE_KEY = "mg_query_cache";
const QUERY_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: QUERY_CACHE_MAX_AGE,
    },
  },
});

/** Only markdown GETs may be written to AsyncStorage — never session/chat keys. */
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
    persister: createAsyncStoragePersister({
      storage: AsyncStorage,
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
