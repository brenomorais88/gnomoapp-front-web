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

