"use client";

import { useApiMutation } from "@/hooks/api/use-api-mutation";
import { useApiQuery } from "@/hooks/api/use-api-query";
import { login, register, getMe } from "@/features/auth/api";
import { queryKeys } from "@/lib/query-keys";
import { AuthCredentialsInput, RegisterInput } from "@/features/auth/types";

export function useRegisterMutation() {
  return useApiMutation({
    mutationFn: (payload: RegisterInput) => register(payload),
    invalidateQueryKeys: [queryKeys.auth.root],
  });
}

export function useLoginMutation() {
  return useApiMutation({
    mutationFn: (payload: AuthCredentialsInput) => login(payload),
    invalidateQueryKeys: [queryKeys.auth.root],
  });
}

export function useAuthMeQuery(enabled = true) {
  return useApiQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: getMe,
    enabled,
  });
}
