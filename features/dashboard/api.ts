import { apiRequest } from "@/lib/api/client";
import { DashboardOverviewDto, DashboardSummaryDto } from "@/features/dashboard/types";
import { isRecord } from "@/lib/api/parsers";

const DASHBOARD_ENDPOINT = "/dashboard";

export async function getDashboardSummary() {
  const payload = await apiRequest<unknown>(DASHBOARD_ENDPOINT);

  if (isRecord(payload) && isRecord(payload.summary)) {
    return payload.summary as DashboardSummaryDto;
  }

  return payload as DashboardSummaryDto;
}

export async function getDashboardOverview() {
  return apiRequest<DashboardOverviewDto>(DASHBOARD_ENDPOINT);
}
