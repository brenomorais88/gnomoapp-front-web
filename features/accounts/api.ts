import {
  AccountOwnershipType,
  AccountDto,
  AccountListQuery,
  CreateAccountInput,
  UpdateAccountInput,
} from "@/features/accounts/types";
import { apiRequest } from "@/lib/api/client";
import { isRecord, parseCollection, parseEntity } from "@/lib/api/parsers";

const ACCOUNTS_ENDPOINT = "/accounts";

function normalizeOwnershipType(value: unknown): AccountOwnershipType {
  return String(value ?? "").toUpperCase() === "FAMILY" ? "FAMILY" : "PERSONAL";
}

function mapAccount(payload: unknown): AccountDto {
  if (!isRecord(payload)) {
    return payload as AccountDto;
  }

  return {
    id: String(payload.id ?? ""),
    title: String(payload.title ?? ""),
    baseAmount: String(payload.baseAmount ?? "0"),
    startDate: String(payload.startDate ?? ""),
    endDate: payload.endDate ? String(payload.endDate) : null,
    recurrenceType: String(payload.recurrenceType ?? "MONTHLY") as AccountDto["recurrenceType"],
    categoryId: String(payload.categoryId ?? ""),
    ownershipType: normalizeOwnershipType(payload.ownershipType),
    responsibleMemberId: payload.responsibleMemberId
      ? String(payload.responsibleMemberId)
      : undefined,
    notes: payload.notes ? String(payload.notes) : undefined,
    active: payload.active === undefined ? undefined : Boolean(payload.active),
    createdAt: payload.createdAt ? String(payload.createdAt) : undefined,
    updatedAt: payload.updatedAt ? String(payload.updatedAt) : undefined,
  };
}

export async function listAccounts(params?: AccountListQuery) {
  const response = await apiRequest<unknown>(ACCOUNTS_ENDPOINT, { query: params });
  return parseCollection<unknown>(response).map(mapAccount);
}

export async function getAccountById(id: string) {
  const response = await apiRequest<unknown>(`${ACCOUNTS_ENDPOINT}/${id}`);
  return mapAccount(parseEntity<unknown>(response));
}

export async function createAccount(payload: CreateAccountInput) {
  const response = await apiRequest<unknown>(ACCOUNTS_ENDPOINT, {
    method: "POST",
    body: payload,
  });
  return mapAccount(parseEntity<unknown>(response));
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
  return mapAccount(parseEntity<unknown>(response));
}

export async function activateAccount(id: string) {
  const response = await apiRequest<unknown>(`${ACCOUNTS_ENDPOINT}/${id}/activate`, {
    method: "PATCH",
  });
  return mapAccount(parseEntity<unknown>(response));
}

export async function deactivateAccount(id: string) {
  const response = await apiRequest<unknown>(`${ACCOUNTS_ENDPOINT}/${id}/deactivate`, {
    method: "PATCH",
  });
  return mapAccount(parseEntity<unknown>(response));
}

export async function deleteAccount(id: string) {
  return apiRequest<void>(`${ACCOUNTS_ENDPOINT}/${id}`, {
    method: "DELETE",
  });
}
