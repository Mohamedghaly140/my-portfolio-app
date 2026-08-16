import { useQuery } from "@tanstack/react-query";

import { fetchMarkdown } from "@/lib/api/markdown";

export function useArticleMarkdown(path: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["markdown", path],
    queryFn: () => fetchMarkdown(path),
  });

  return { data, isLoading, error, refetch };
}
