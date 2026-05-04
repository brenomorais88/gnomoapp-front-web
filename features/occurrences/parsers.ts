import { OccurrenceDto, OccurrenceScope, OccurrenceStatus } from "@/features/occurrences/types";
import { isRecord } from "@/lib/api/parsers";

export function fromApiOccurrenceStatus(status?: unknown): OccurrenceStatus | undefined {
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

/** `GET /occurrences` only accepts `status=PENDING` or `status=PAID`. */
export function toApiOccurrenceListStatus(status?: OccurrenceStatus): "PENDING" | "PAID" | undefined {
  if (status === "pending") {
    return "PENDING";
  }

  if (status === "paid") {
    return "PAID";
  }

  return undefined;
}

function fromApiScope(scope?: unknown): OccurrenceScope | undefined {
  if (typeof scope !== "string") {
    return undefined;
  }

  return scope.toUpperCase() === "FAMILY" ? "FAMILY" : "PERSONAL";
}

function normalizeDateString(value?: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.length >= 10 ? trimmed.slice(0, 10) : trimmed;
}

export function mapOccurrenceFromApi(payload: unknown): OccurrenceDto {
  if (!isRecord(payload)) {
    return payload as OccurrenceDto;
  }

  const rawAmount = payload.amountSnapshot ?? payload.amount ?? 0;
  const parsedAmount =
    typeof rawAmount === "number" ? rawAmount : Number.parseFloat(String(rawAmount));

  return {
    id: String(payload.id ?? ""),
    description: String(payload.description ?? payload.title ?? ""),
    amount: Number.isNaN(parsedAmount) ? 0 : parsedAmount,
    dueDate: normalizeDateString(payload.dueDate),
    status: fromApiOccurrenceStatus(payload.status),
    accountId: payload.accountId !== undefined ? String(payload.accountId) : undefined,
    categoryId:
      payload.categoryId !== undefined
        ? String(payload.categoryId)
        : payload.categoryIdSnapshot !== undefined
          ? String(payload.categoryIdSnapshot)
          : undefined,
    scope: fromApiScope(payload.scope),
    paidAt: payload.paidAt ? String(payload.paidAt) : undefined,
    createdAt: payload.createdAt ? String(payload.createdAt) : undefined,
    updatedAt: payload.updatedAt ? String(payload.updatedAt) : undefined,
  };
}
