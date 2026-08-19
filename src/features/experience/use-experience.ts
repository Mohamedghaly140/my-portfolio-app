import { useQuery } from "@tanstack/react-query";

import { experience } from "@/data/experience";
import { fetchExperience } from "@/lib/api/experience";

export function useExperience() {
  return useQuery({
    queryKey: ["experience"],
    queryFn: fetchExperience,
    initialData: experience,
  });
}
