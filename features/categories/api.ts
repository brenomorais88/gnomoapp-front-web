import {
  CategoryScope,
  CategoryDto,
  CategoryListQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/features/categories/types";
import { apiRequest } from "@/lib/api/client";
import { isRecord, parseCollection, parseEntity } from "@/lib/api/parsers";

const CATEGORIES_ENDPOINT = "/categories";

function normalizeScope(value: unknown): CategoryScope {
  const scope = String(value ?? "").toUpperCase();

  if (scope === "GLOBAL") {
    return "GLOBAL";
  }

  if (scope === "FAMILY") {
    return "FAMILY";
  }

  return "PERSONAL";
}

function mapCategory(payload: unknown): CategoryDto {
  if (!isRecord(payload)) {
    return payload as CategoryDto;
  }

  return {
    id: String(payload.id ?? ""),
    name: String(payload.name ?? ""),
    description: payload.description ? String(payload.description) : undefined,
    color: payload.color ? String(payload.color) : undefined,
    active: payload.active === undefined ? undefined : Boolean(payload.active),
    scope: normalizeScope(payload.scope),
    createdAt: payload.createdAt ? String(payload.createdAt) : undefined,
    updatedAt: payload.updatedAt ? String(payload.updatedAt) : undefined,
  };
}

export async function listCategories(params?: CategoryListQuery) {
  const response = await apiRequest<unknown>(CATEGORIES_ENDPOINT, { query: params });
  return parseCollection<unknown>(response).map(mapCategory);
}

export async function getCategoryById(id: string) {
  const response = await apiRequest<unknown>(`${CATEGORIES_ENDPOINT}/${id}`);
  return mapCategory(parseEntity<unknown>(response));
}

export async function createCategory(payload: CreateCategoryInput) {
  const response = await apiRequest<unknown>(CATEGORIES_ENDPOINT, {
    method: "POST",
    body: payload,
  });
  return mapCategory(parseEntity<unknown>(response));
}

export async function updateCategory({
  id,
  payload,
}: {
  id: string;
  payload: UpdateCategoryInput;
}) {
  const response = await apiRequest<unknown>(`${CATEGORIES_ENDPOINT}/${id}`, {
    method: "PUT",
    body: payload,
  });
  return mapCategory(parseEntity<unknown>(response));
}

export async function deleteCategory(id: string) {
  return apiRequest<void>(`${CATEGORIES_ENDPOINT}/${id}`, {
    method: "DELETE",
  });
}
