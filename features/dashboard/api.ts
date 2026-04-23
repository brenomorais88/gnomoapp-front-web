import { apiRequest } from "@/lib/api/client";
import {
  DashboardCategorySummaryDto,
  DashboardDayDto,
  DashboardHomeDto,
  DashboardNext12MonthsDto,
} from "@/features/dashboard/types";
import { isRecord, parseCollection, parseEntity } from "@/lib/api/parsers";

const DASHBOARD_ENDPOINT = "/dashboard";

export async function getDashboardHome(month: string) {
  const payload = await apiRequest<unknown>(`${DASHBOARD_ENDPOINT}/home`, {
    query: { month },
  });

  return parseEntity<DashboardHomeDto>(payload);
}

export async function getDashboardDay(date: string) {
  const payload = await apiRequest<unknown>(`${DASHBOARD_ENDPOINT}/day`, {
    query: { date },
  });
  const entity = parseEntity<unknown>(payload);

  if (isRecord(entity)) {
    const rawItems = parseCollection(entity.items ?? entity.occurrences ?? []);
    const fallbackTotal = rawItems.reduce<number>((sum, item) => {
      if (isRecord(item)) {
        const amount = Number.parseFloat(String(item.amount ?? 0));
        return sum + (Number.isNaN(amount) ? 0 : amount);
      }
      return sum;
    }, 0);
    return {
      date: String(entity.date ?? date),
      items: rawItems as DashboardDayDto["items"],
      totalAmount: entity.totalAmount ?? entity.total ?? fallbackTotal,
    } as DashboardDayDto;
  }

  return {
    date,
    items: [],
    totalAmount: 0,
  } as DashboardDayDto;
}

export async function getDashboardNext12Months(includeDetails: boolean) {
  const payload = await apiRequest<unknown>(`${DASHBOARD_ENDPOINT}/next-12-months`, {
    query: { includeDetails },
  });
  const entity = parseEntity<unknown>(payload);

  if (isRecord(entity)) {
    const points = parseCollection(entity.points ?? entity.data ?? entity.months);
    return { points } as DashboardNext12MonthsDto;
  }

  return { points: [] } as DashboardNext12MonthsDto;
}

export async function getDashboardCategorySummary(month: string) {
  const payload = await apiRequest<unknown>(`${DASHBOARD_ENDPOINT}/category-summary`, {
    query: { month },
  });
  const entity = parseEntity<unknown>(payload);

  if (isRecord(entity)) {
    const items = parseCollection(entity.items ?? entity.data ?? entity.summary);
    return {
      month: String(entity.month ?? month),
      items: items as DashboardCategorySummaryDto["items"],
    } as DashboardCategorySummaryDto;
  }

  return {
    month,
    items: [],
  } as DashboardCategorySummaryDto;
}
