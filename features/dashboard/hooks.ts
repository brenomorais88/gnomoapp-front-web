"use client";

import {
  getDashboardCategorySummary,
  getDashboardDay,
  getDashboardHome,
  getDashboardNext12Months,
} from "@/features/dashboard/api";
import { useApiQuery } from "@/hooks/api/use-api-query";
import { queryKeys } from "@/lib/query-keys";

export function useDashboardHomeQuery(month: string) {
  return useApiQuery({
    queryKey: queryKeys.dashboard.home(month),
    queryFn: () => getDashboardHome(month),
    enabled: Boolean(month),
  });
}

export function useDashboardDayQuery(date: string) {
  return useApiQuery({
    queryKey: queryKeys.dashboard.day(date),
    queryFn: () => getDashboardDay(date),
    enabled: Boolean(date),
  });
}

export function useDashboardCategorySummaryQuery(month: string) {
  return useApiQuery({
    queryKey: queryKeys.dashboard.categorySummary(month),
    queryFn: () => getDashboardCategorySummary(month),
    enabled: Boolean(month),
  });
}

export function useDashboardNext12MonthsQuery(includeDetails = false) {
  return useApiQuery({
    queryKey: queryKeys.dashboard.next12Months(includeDetails),
    queryFn: () => getDashboardNext12Months(includeDetails),
  });
}
