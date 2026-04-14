"use client";

import {
  createOccurrence,
  deleteOccurrence,
  getOccurrenceById,
  listOccurrences,
  updateOccurrence,
} from "@/features/occurrences/api";
import {
  CreateOccurrenceInput,
  OccurrenceListQuery,
  UpdateOccurrenceInput,
} from "@/features/occurrences/types";
import { useApiMutation } from "@/hooks/api/use-api-mutation";
import { useApiQuery } from "@/hooks/api/use-api-query";
import { queryKeys } from "@/lib/query-keys";

export function useOccurrencesListQuery(params?: OccurrenceListQuery) {
  return useApiQuery({
    queryKey: queryKeys.occurrences.list(params),
    queryFn: () => listOccurrences(params),
  });
}

export function useOccurrenceDetailQuery(id: string) {
  return useApiQuery({
    queryKey: queryKeys.occurrences.detail(id),
    queryFn: () => getOccurrenceById(id),
    enabled: Boolean(id),
  });
}

export function useCreateOccurrenceMutation() {
  return useApiMutation({
    mutationFn: (payload: CreateOccurrenceInput) => createOccurrence(payload),
    invalidateQueryKeys: [queryKeys.occurrences.root],
  });
}

export function useUpdateOccurrenceMutation() {
  return useApiMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOccurrenceInput }) =>
      updateOccurrence({ id, payload }),
    invalidateQueryKeys: [queryKeys.occurrences.root],
  });
}

export function useDeleteOccurrenceMutation() {
  return useApiMutation({
    mutationFn: (id: string) => deleteOccurrence(id),
    invalidateQueryKeys: [queryKeys.occurrences.root],
  });
}
