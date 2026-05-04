import { OccurrenceDto, OccurrenceListScope, OccurrenceStatus } from "@/features/occurrences/types";

export type DashboardHomeOccurrenceDto = {
  id: string;
  accountId?: string;
  categoryId?: string;
  title: string;
  amount: string | number;
  dueDate: string;
  status: string;
};

export type DashboardCategorySummaryItemDto = {
  categoryId: string;
  totalAmount: string | number;
  count: number;
};

export type DashboardHomeDto = {
  overdue: DashboardHomeOccurrenceDto[];
  next7Days: DashboardHomeOccurrenceDto[];
  upcoming: DashboardHomeOccurrenceDto[];
  totalPendingInMonth: string | number;
  totalPaidInMonth: string | number;
};

export type DashboardDayDto = {
  date: string;
  items: DashboardHomeOccurrenceDto[];
  totalAmount?: string | number;
};

export type DashboardNext12MonthsPointDto = {
  month: string;
  totalAmount: string | number;
  count?: number;
  items?: DashboardHomeOccurrenceDto[];
};

export type DashboardNext12MonthsDto = {
  points: DashboardNext12MonthsPointDto[];
};

export type DashboardCategorySummaryDto = {
  month: string;
  items: DashboardCategorySummaryItemDto[];
};

export type FinancialDashboardFilters = {
  scope: OccurrenceListScope;
  accountId?: string;
  statuses?: OccurrenceStatus[];
  month: string;
  timezone?: string;
};

export type FinancialDashboardOccurrenceDto = OccurrenceDto;

export type FinancialDashboardOccurrenceViewModel = {
  id: string;
  /** Display title: API `titleSnapshot` or `description`. */
  titleSnapshot: string;
  description: string;
  amount: number;
  dueDate: Date;
  dueDateKey: string;
  /** When the occurrence was marked paid (API `paidAt`). */
  paidAt?: Date;
  status: OccurrenceStatus;
  accountId?: string;
  categoryId?: string;
  scope?: "PERSONAL" | "FAMILY";
};

export type FinancialDashboardData = {
  timezone: string;
  filters: {
    scope: OccurrenceListScope;
    accountId?: string;
    statuses: OccurrenceStatus[];
    from: string;
    to: string;
    month: string;
  };
  source: {
    backendApplied: string[];
    frontendApplied: string[];
  };
  occurrences: FinancialDashboardOccurrenceViewModel[];
};

