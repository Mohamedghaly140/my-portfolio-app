import { fetch as expoFetch } from "expo/fetch";
import { getStoredSession, setStoredSession } from "../session/chatSession";

const API_ORIGIN = process.env.EXPO_PUBLIC_API_ORIGIN;

export async function apiRequest(path: string, init: RequestInit = {}): Promise<Response> {
  if (!API_ORIGIN) {
    throw new Error("EXPO_PUBLIC_API_ORIGIN is not set");
  }
  const session = await getStoredSession();
  const headers = new Headers(init.headers);
  headers.set("origin", API_ORIGIN);
  headers.set("x-mg-client", "mobile/1.0");
  if (session) headers.set("x-mg-session", session);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await expoFetch(`${API_ORIGIN}${path}`, { ...init, headers });

  const reissued = response.headers.get("x-mg-session");
  if (reissued) await setStoredSession(reissued);

  return response;
}
