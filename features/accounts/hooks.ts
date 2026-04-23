"use client";

import {
  activateAccount,
  createAccount,
  deactivateAccount,
  deleteAccount,
  getAccountById,
  listAccounts,
  updateAccount,
} from "@/features/accounts/api";
import {
  AccountListQuery,
  CreateAccountInput,
  UpdateAccountInput,
} from "@/features/accounts/types";
import { useApiMutation } from "@/hooks/api/use-api-mutation";
import { useApiQuery } from "@/hooks/api/use-api-query";
import { queryKeys } from "@/lib/query-keys";

export function useAccountsListQuery(params?: AccountListQuery) {
  return useApiQuery({
    queryKey: queryKeys.accounts.list(params),
    queryFn: () => listAccounts(params),
  });
}

export function useAccountDetailQuery(id: string) {
  return useApiQuery({
    queryKey: queryKeys.accounts.detail(id),
    queryFn: () => getAccountById(id),
    enabled: Boolean(id),
  });
}

export function useCreateAccountMutation() {
  return useApiMutation({
    mutationFn: (payload: CreateAccountInput) => createAccount(payload),
    invalidateQueryKeys: [queryKeys.accounts.root, queryKeys.dashboard.root],
  });
}

export function useUpdateAccountMutation() {
  return useApiMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAccountInput }) =>
      updateAccount({ id, payload }),
    invalidateQueryKeys: [queryKeys.accounts.root, queryKeys.dashboard.root],
  });
}

export function useDeleteAccountMutation() {
  return useApiMutation({
    mutationFn: (id: string) => deleteAccount(id),
    invalidateQueryKeys: [queryKeys.accounts.root, queryKeys.dashboard.root],
  });
}

export function useActivateAccountMutation() {
  return useApiMutation({
    mutationFn: (id: string) => activateAccount(id),
    invalidateQueryKeys: [queryKeys.accounts.root, queryKeys.dashboard.root],
  });
}

export function useDeactivateAccountMutation() {
  return useApiMutation({
    mutationFn: (id: string) => deactivateAccount(id),
    invalidateQueryKeys: [queryKeys.accounts.root, queryKeys.dashboard.root],
  });
}
