import { PaginatedResult } from "@/types/api/common";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseCollection<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  const candidates = [payload.items, payload.data, payload.content];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  return [];
}

export function parseEntity<T>(payload: unknown): T {
  if (isRecord(payload) && "data" in payload && payload.data) {
    return payload.data as T;
  }

  return payload as T;
}

export function parsePaginatedCollection<T>(payload: unknown): PaginatedResult<T> {
  const fallbackItems = parseCollection<T>(payload);

  if (!isRecord(payload)) {
    return {
      items: fallbackItems,
      total: fallbackItems.length,
      page: 0,
      size: fallbackItems.length,
    };
  }

  const items = parseCollection<T>(payload);

  return {
    items,
    total: Number(payload.totalElements ?? payload.total ?? items.length),
    page: Number(payload.page ?? payload.number ?? 0),
    size: Number(payload.size ?? payload.pageSize ?? items.length),
  };
}
