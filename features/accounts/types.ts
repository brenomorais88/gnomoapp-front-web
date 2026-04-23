import { EntityBase, ListQueryParams, SortDirection } from "@/types/api/common";

export type AccountOwnershipType = "PERSONAL" | "FAMILY";
export type AccountListScope = "PERSONAL" | "FAMILY" | "VISIBLE_TO_ME";

export type AccountRecurrenceType =
  | "ONCE"
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY";

export type AccountDto = EntityBase & {
  title: string;
  baseAmount: string;
  startDate: string;
  endDate?: string | null;
  recurrenceType: AccountRecurrenceType;
  categoryId: string;
  ownershipType: AccountOwnershipType;
  responsibleMemberId?: string;
  notes?: string;
  active?: boolean;
};

export type AccountListQuery = ListQueryParams & {
  scope?: AccountListScope;
  categoryId?: string;
  active?: boolean;
  sortBy?: string;
  sortDirection?: SortDirection;
};

export type CreateAccountInput = {
  title: string;
  baseAmount: string;
  startDate: string;
  endDate?: string | null;
  recurrenceType: AccountRecurrenceType;
  categoryId: string;
  ownershipType: AccountOwnershipType;
  responsibleMemberId?: string;
  notes?: string;
  active?: boolean;
};

export type UpdateAccountInput = Partial<CreateAccountInput>;
