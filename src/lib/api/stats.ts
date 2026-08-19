import { apiRequest } from "./client";
import type { StatItem } from "@/data/stats";

export async function fetchStats(): Promise<StatItem[]> {
  const response = await apiRequest("/api/stats");
  if (!response.ok) {
    throw new Error(String(response.status));
  }
  const body = (await response.json()) as { data: StatItem[] };
  return body.data;
}
