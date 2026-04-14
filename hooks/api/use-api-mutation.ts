"use client";

import {
  type QueryKey,
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ApiError } from "@/lib/api/error";

type UseApiMutationOptions<TData, TVariables> = UseMutationOptions<
  TData,
  ApiError,
  TVariables
> & {
  invalidateQueryKeys?: QueryKey[];
};

export function useApiMutation<TData, TVariables>(
  options: UseApiMutationOptions<TData, TVariables>,
) {
  const queryClient = useQueryClient();
  const { invalidateQueryKeys, ...mutationOptions } = options;

  return useMutation({
    ...mutationOptions,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await mutationOptions.onSuccess?.(
        data,
        variables,
        onMutateResult,
        context,
      );
      if (invalidateQueryKeys?.length) {
        await Promise.all(
          invalidateQueryKeys.map((queryKey) =>
            queryClient.invalidateQueries({ queryKey }),
          ),
        );
      }
    },
    onSettled: async (data, error, variables, onMutateResult, context) => {
      await mutationOptions.onSettled?.(
        data,
        error,
        variables,
        onMutateResult,
        context,
      );
    },
  });
}
