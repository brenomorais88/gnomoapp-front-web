import { EntityBase, ListQueryParams, SortDirection } from "@/types/api/common";

export type AccountRecurrenceType =
  | "ONCE"
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY";

export type AccountDto = EntityBase & {
  title: string;
  baseAmount: number;
  startDate: string;
  endDate?: string | null;
  recurrenceType: AccountRecurrenceType;
  categoryId: string;
  notes?: string;
  active?: boolean;
};

export type AccountListQuery = ListQueryParams & {
  categoryId?: string;
  active?: boolean;
  sortBy?: string;
  sortDirection?: SortDirection;
};

export type CreateAccountInput = {
  title: string;
  baseAmount: number;
  startDate: string;
  endDate?: string | null;
  recurrenceType: AccountRecurrenceType;
  categoryId: string;
  notes?: string;
  active?: boolean;
};

export type UpdateAccountInput = Partial<CreateAccountInput>;
