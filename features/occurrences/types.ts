import { EntityBase, ListQueryParams, SortDirection } from "@/types/api/common";

export type OccurrenceStatus = "pending" | "paid" | "overdue" | "cancelled";
export type OccurrenceStatusApi = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
export type OccurrenceScope = "PERSONAL" | "FAMILY";
export type OccurrenceListScope = "PERSONAL" | "FAMILY" | "VISIBLE_TO_ME";

export type OccurrenceDto = EntityBase & {
  description: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status?: OccurrenceStatus;
  accountId?: string;
  categoryId?: string;
  scope?: OccurrenceScope;
};

export type OccurrenceListQuery = ListQueryParams & {
  scope?: OccurrenceListScope;
  accountId?: string;
  categoryId?: string;
  status?: OccurrenceStatus;
  text?: string;
  startDate?: string;
  endDate?: string;
  month?: string;
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

export type OverrideOccurrenceAmountInput = {
  id: string;
  amount: string;
};
