export type DashboardSummaryDto = {
  totalPlanned?: number;
  totalPaid?: number;
  totalPending?: number;
  overdueCount?: number;
};

export type DashboardPointDto = {
  label: string;
  value: number;
};

export type DashboardOverviewDto = {
  summary?: DashboardSummaryDto;
  monthlyProjection?: DashboardPointDto[];
};
