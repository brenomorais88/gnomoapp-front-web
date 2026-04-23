import { EntityBase, ListQueryParams, SortDirection } from "@/types/api/common";

export type CategoryScope = "GLOBAL" | "FAMILY" | "PERSONAL";

export type CategoryDto = EntityBase & {
  name: string;
  description?: string;
  color?: string;
  active?: boolean;
  scope: CategoryScope;
};

export type CategoryListQuery = ListQueryParams & {
  active?: boolean;
  sortBy?: string;
  sortDirection?: SortDirection;
};

export type CreateCategoryInput = {
  name: string;
  description?: string;
  color?: string;
  active?: boolean;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;
