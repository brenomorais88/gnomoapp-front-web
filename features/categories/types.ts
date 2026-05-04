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

/** POST /categories — body matches backend contract (see API / Postman). */
export type CreateCategoryInput = {
  name: string;
  description?: string;
  color?: string;
};

export type UpdateCategoryInput = Partial<
  CreateCategoryInput & {
    active: boolean;
  }
>;
