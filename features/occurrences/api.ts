import {
  OverrideOccurrenceAmountInput,
  OccurrenceDto,
  OccurrenceListQuery,
  OccurrenceScope,
  OccurrenceStatus,
  OccurrenceStatusApi,
} from "@/features/occurrences/types";
import { apiRequest } from "@/lib/api/client";
import { isRecord, parseCollection, parseEntity } from "@/lib/api/parsers";

const OCCURRENCES_ENDPOINT = "/occurrences";

function toApiStatus(status?: OccurrenceStatus): OccurrenceStatusApi | undefined {
  if (!status) {
    return undefined;
  }

  return status.toUpperCase() as OccurrenceStatusApi;
}

function fromApiStatus(status?: unknown): OccurrenceStatus | undefined {
  if (typeof status !== "string") {
    return undefined;
  }

  switch (status.toUpperCase()) {
    case "PENDING":
      return "pending";
    case "PAID":
      return "paid";
    case "OVERDUE":
      return "overdue";
    case "CANCELLED":
      return "cancelled";
    default:
      return undefined;
  }
}

function fromApiScope(scope?: unknown): OccurrenceScope | undefined {
  if (typeof scope !== "string") {
    return undefined;
  }

  return scope.toUpperCase() === "FAMILY" ? "FAMILY" : "PERSONAL";
}

function mapOccurrenceFromApi(payload: unknown): OccurrenceDto {
  if (!isRecord(payload)) {
    return payload as OccurrenceDto;
  }

  const amountValue = payload.amount;
  const parsedAmount =
    typeof amountValue === "number"
      ? amountValue
      : Number.parseFloat(String(amountValue ?? 0));

  return {
    id: String(payload.id ?? ""),
    description: String(payload.description ?? payload.title ?? ""),
    amount: Number.isNaN(parsedAmount) ? 0 : parsedAmount,
    dueDate: String(payload.dueDate ?? ""),
    status: fromApiStatus(payload.status),
    accountId:
      payload.accountId !== undefined ? String(payload.accountId) : undefined,
    categoryId:
      payload.categoryId !== undefined ? String(payload.categoryId) : undefined,
    scope: fromApiScope(payload.scope),
    paidAt: payload.paidAt ? String(payload.paidAt) : undefined,
    createdAt: payload.createdAt ? String(payload.createdAt) : undefined,
    updatedAt: payload.updatedAt ? String(payload.updatedAt) : undefined,
  };
}

export async function listOccurrences(params?: OccurrenceListQuery) {
  const response = await apiRequest<unknown>(OCCURRENCES_ENDPOINT, {
    query: {
      ...params,
      status: toApiStatus(params?.status),
    },
  });
  return parseCollection<unknown>(response).map(mapOccurrenceFromApi);
}

export async function getOccurrenceById(id: string) {
  const response = await apiRequest<unknown>(`${OCCURRENCES_ENDPOINT}/${id}`);
  return mapOccurrenceFromApi(parseEntity<unknown>(response));
}

export async function markOccurrencePaid(id: string) {
  const response = await apiRequest<unknown>(`${OCCURRENCES_ENDPOINT}/${id}/mark-paid`, {
    method: "PATCH",
  });

  return mapOccurrenceFromApi(parseEntity<unknown>(response));
}

export async function unmarkOccurrencePaid(id: string) {
  const response = await apiRequest<unknown>(`${OCCURRENCES_ENDPOINT}/${id}/unmark-paid`, {
    method: "PATCH",
  });

  return mapOccurrenceFromApi(parseEntity<unknown>(response));
}

export async function overrideOccurrenceAmount({
  id,
  amount,
}: OverrideOccurrenceAmountInput) {
  const response = await apiRequest<unknown>(`${OCCURRENCES_ENDPOINT}/${id}/override-amount`, {
    method: "PATCH",
    body: {
      amount,
    },
  });

  return mapOccurrenceFromApi(parseEntity<unknown>(response));
}
