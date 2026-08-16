import { apiRequest } from "./client";
import { CHAT_ERRORS } from "./errors";

export const MARKDOWN_ERRORS = {
  NOT_FOUND: { retryable: false, message: "Article unavailable." },
  NETWORK: CHAT_ERRORS.NETWORK,
  INTERNAL: { retryable: true, message: "Something went wrong. Try again." },
} as const;

export async function fetchMarkdown(path: string): Promise<string> {
  const response = await apiRequest(
    `/api/markdown?path=${encodeURIComponent(path)}`,
  );

  if (!response.ok) {
    throw new Error(String(response.status));
  }

  return response.text();
}

export function parseMarkdownError(error: unknown): {
  message: string;
  retryable: boolean;
} {
  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return { ...MARKDOWN_ERRORS.NETWORK };
  }

  if (error instanceof Error) {
    const message = error.message;
    if (message === "404" || /not found/i.test(message)) {
      return { ...MARKDOWN_ERRORS.NOT_FOUND };
    }
  }

  return { ...MARKDOWN_ERRORS.INTERNAL };
}
