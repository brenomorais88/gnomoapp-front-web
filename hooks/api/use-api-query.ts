"use client";

import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import { ApiError } from "@/lib/api/error";

export function useApiQuery<TData, TQueryKey extends QueryKey>(
  options: UseQueryOptions<TData, ApiError, TData, TQueryKey>,
) {
  return useQuery(options);
}
