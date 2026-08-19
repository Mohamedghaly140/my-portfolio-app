import { apiRequest } from "./client";
import type { ExperienceItem } from "@/types/experience";

export async function fetchExperience(): Promise<ExperienceItem[]> {
  const response = await apiRequest("/api/experience");
  if (!response.ok) {
    throw new Error(String(response.status));
  }
  const body = (await response.json()) as { data: ExperienceItem[] };
  return body.data;
}
