"use client";

import { getHealthStatus } from "@/features/health/api";
import { queryKeys } from "@/lib/query-keys";
import { useApiQuery } from "@/hooks/api/use-api-query";

export function useHealthStatusQuery() {
  return useApiQuery({
    queryKey: queryKeys.health.status(),
    queryFn: getHealthStatus,
    staleTime: 1000 * 30,
  });
}
