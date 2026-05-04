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

/** Backend may expose the primary key as `id`, `uuid`, etc. Empty `value`s on `<option>` break selects + Zod. */
function resolveCategoryId(payload: Record<string, unknown>): string {
  for (const key of ["id", "uuid", "categoryId", "publicId"] as const) {
    const raw = payload[key];
    if (raw === undefined || raw === null) {
      continue;
    }
    const str = String(raw).trim();
    if (str) {
      return str;
    }
  }
  return "";
}

function mapCategory(payload: unknown): CategoryDto {
  if (!isRecord(payload)) {
    return payload as CategoryDto;
  }

  return {
    id: resolveCategoryId(payload),
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

function buildCreateCategoryBody(payload: CreateCategoryInput) {
  const body: Record<string, string> = {
    name: payload.name.trim(),
  };
  const description = payload.description?.trim();
  if (description) {
    body.description = description;
  }
  const color = payload.color?.trim();
  if (color) {
    body.color = color;
  }
  return body;
}

export async function createCategory(payload: CreateCategoryInput) {
  const response = await apiRequest<unknown>(CATEGORIES_ENDPOINT, {
    method: "POST",
    body: buildCreateCategoryBody(payload),
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
