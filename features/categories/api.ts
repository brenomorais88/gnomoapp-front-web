import {
  CategoryDto,
  CategoryListQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/features/categories/types";
import { apiRequest } from "@/lib/api/client";
import { parseCollection, parseEntity } from "@/lib/api/parsers";

const CATEGORIES_ENDPOINT = "/categories";

export async function listCategories(params?: CategoryListQuery) {
  const response = await apiRequest<unknown>(CATEGORIES_ENDPOINT, { query: params });
  return parseCollection<CategoryDto>(response);
}

export async function getCategoryById(id: string) {
  const response = await apiRequest<unknown>(`${CATEGORIES_ENDPOINT}/${id}`);
  return parseEntity<CategoryDto>(response);
}

export async function createCategory(payload: CreateCategoryInput) {
  const response = await apiRequest<unknown>(CATEGORIES_ENDPOINT, {
    method: "POST",
    body: payload,
  });
  return parseEntity<CategoryDto>(response);
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
  return parseEntity<CategoryDto>(response);
}

export async function deleteCategory(id: string) {
  return apiRequest<void>(`${CATEGORIES_ENDPOINT}/${id}`, {
    method: "DELETE",
  });
}
