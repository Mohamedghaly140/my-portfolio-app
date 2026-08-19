import { useQuery } from "@tanstack/react-query";

import { stats } from "@/data/stats";
import { fetchStats } from "@/lib/api/stats";

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    initialData: stats,
  });
}
