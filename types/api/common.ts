export type EntityId = string;

export type TimestampFields = {
  createdAt?: string;
  updatedAt?: string;
};

export type EntityBase = {
  id: EntityId;
} & TimestampFields;

export type ListQueryParams = {
  page?: number;
  size?: number;
  search?: string;
};

export type SortDirection = "asc" | "desc";

export type PaginatedResult<TItem> = {
  items: TItem[];
  total: number;
  page: number;
  size: number;
};
