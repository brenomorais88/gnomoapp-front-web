import {
  AccountDto,
  AccountListQuery,
  CreateAccountInput,
  UpdateAccountInput,
} from "@/features/accounts/types";
import { apiRequest } from "@/lib/api/client";
import { parseCollection, parseEntity } from "@/lib/api/parsers";

const ACCOUNTS_ENDPOINT = "/accounts";

export async function listAccounts(params?: AccountListQuery) {
  const response = await apiRequest<unknown>(ACCOUNTS_ENDPOINT, { query: params });
  return parseCollection<AccountDto>(response);
}

export async function getAccountById(id: string) {
  const response = await apiRequest<unknown>(`${ACCOUNTS_ENDPOINT}/${id}`);
  return parseEntity<AccountDto>(response);
}

export async function createAccount(payload: CreateAccountInput) {
  const response = await apiRequest<unknown>(ACCOUNTS_ENDPOINT, {
    method: "POST",
    body: payload,
  });
  return parseEntity<AccountDto>(response);
}

export async function updateAccount({
  id,
  payload,
}: {
  id: string;
  payload: UpdateAccountInput;
}) {
  const response = await apiRequest<unknown>(`${ACCOUNTS_ENDPOINT}/${id}`, {
    method: "PUT",
    body: payload,
  });
  return parseEntity<AccountDto>(response);
}

export async function deleteAccount(id: string) {
  return apiRequest<void>(`${ACCOUNTS_ENDPOINT}/${id}`, {
    method: "DELETE",
  });
}
