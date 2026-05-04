"use client";

import {
  getOccurrenceById,
  listOccurrences,
  markOccurrencePaid,
  overrideOccurrenceAmount,
  unmarkOccurrencePaid,
} from "@/features/occurrences/api";
import {
  OverrideOccurrenceAmountInput,
  OccurrenceListQuery,
} from "@/features/occurrences/types";
import { useApiMutation } from "@/hooks/api/use-api-mutation";
import { useApiQuery } from "@/hooks/api/use-api-query";
import { queryKeys } from "@/lib/query-keys";

export function useOccurrencesListQuery(params: OccurrenceListQuery) {
  return useApiQuery({
    queryKey: queryKeys.occurrences.list(params),
    queryFn: () => listOccurrences(params),
    enabled: Boolean(params.startDate && params.endDate),
  });
}

export function useOccurrenceDetailQuery(id: string) {
  return useApiQuery({
    queryKey: queryKeys.occurrences.detail(id),
    queryFn: () => getOccurrenceById(id),
    enabled: Boolean(id),
  });
}

export function useMarkOccurrencePaidMutation() {
  return useApiMutation({
    mutationFn: (id: string) => markOccurrencePaid(id),
    invalidateQueryKeys: [queryKeys.occurrences.root, queryKeys.dashboard.root],
  });
}

export function useUnmarkOccurrencePaidMutation() {
  return useApiMutation({
    mutationFn: (id: string) => unmarkOccurrencePaid(id),
    invalidateQueryKeys: [queryKeys.occurrences.root, queryKeys.dashboard.root],
  });
}

export function useOverrideOccurrenceAmountMutation() {
  return useApiMutation({
    mutationFn: (payload: OverrideOccurrenceAmountInput) =>
      overrideOccurrenceAmount(payload),
    invalidateQueryKeys: [queryKeys.occurrences.root, queryKeys.dashboard.root],
  });
}
