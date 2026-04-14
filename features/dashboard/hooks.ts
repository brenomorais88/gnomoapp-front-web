"use client";

import { getDashboardOverview, getDashboardSummary } from "@/features/dashboard/api";
import { useApiQuery } from "@/hooks/api/use-api-query";
import { queryKeys } from "@/lib/query-keys";

export function useDashboardSummaryQuery() {
  return useApiQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: getDashboardSummary,
  });
}

export function useDashboardOverviewQuery() {
  return useApiQuery({
    queryKey: [...queryKeys.dashboard.root, "overview"],
    queryFn: getDashboardOverview,
  });
}
