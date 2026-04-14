"use client";

import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from "@/features/categories/api";
import {
  CategoryListQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/features/categories/types";
import { useApiMutation } from "@/hooks/api/use-api-mutation";
import { useApiQuery } from "@/hooks/api/use-api-query";
import { queryKeys } from "@/lib/query-keys";

export function useCategoriesListQuery(params?: CategoryListQuery) {
  return useApiQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => listCategories(params),
  });
}

export function useCategoryDetailQuery(id: string) {
  return useApiQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => getCategoryById(id),
    enabled: Boolean(id),
  });
}

export function useCreateCategoryMutation() {
  return useApiMutation({
    mutationFn: (payload: CreateCategoryInput) => createCategory(payload),
    invalidateQueryKeys: [queryKeys.categories.root],
  });
}

export function useUpdateCategoryMutation() {
  return useApiMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryInput }) =>
      updateCategory({ id, payload }),
    invalidateQueryKeys: [queryKeys.categories.root],
  });
}

export function useDeleteCategoryMutation() {
  return useApiMutation({
    mutationFn: (id: string) => deleteCategory(id),
    invalidateQueryKeys: [queryKeys.categories.root],
  });
}
