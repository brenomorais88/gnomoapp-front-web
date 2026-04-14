import { EntityBase, ListQueryParams, SortDirection } from "@/types/api/common";

export type OccurrenceStatus = "pending" | "paid" | "overdue" | "cancelled";

export type OccurrenceDto = EntityBase & {
  description: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status?: OccurrenceStatus;
  accountId?: string;
  categoryId?: string;
};

export type OccurrenceListQuery = ListQueryParams & {
  accountId?: string;
  categoryId?: string;
  status?: OccurrenceStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
};

export type CreateOccurrenceInput = {
  description: string;
  amount: number;
  dueDate: string;
  accountId?: string;
  categoryId?: string;
  status?: OccurrenceStatus;
};

export type UpdateOccurrenceInput = Partial<CreateOccurrenceInput> & {
  paidAt?: string | null;
};
