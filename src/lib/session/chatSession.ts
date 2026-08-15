import * as SecureStore from "expo-secure-store";

const SESSION_KEY = "mg_chat_session";

export async function getStoredSession(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function setStoredSession(value: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, value);
}

export async function clearStoredSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
