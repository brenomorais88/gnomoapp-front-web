import { apiRequest } from "@/lib/api/client";
import {
  DashboardCategorySummaryDto,
  DashboardDayDto,
  DashboardHomeDto,
  FinancialDashboardData,
  FinancialDashboardFilters,
  FinancialDashboardOccurrenceViewModel,
  DashboardNext12MonthsDto,
} from "@/features/dashboard/types";
import {
  buildMonthRange,
  resolveUserTimezone,
  toFinancialDashboardOccurrenceViewModel,
  toStatusFilterSet,
} from "@/features/dashboard/parsers";
import { listOccurrences } from "@/features/occurrences/api";
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

export async function getFinancialDashboardData(
  filters: FinancialDashboardFilters,
): Promise<FinancialDashboardData> {
  const timezone = filters.timezone || resolveUserTimezone();
  const monthRange = buildMonthRange(filters.month);
  const statusFilters = filters.statuses ?? [];
  const statusSet = toStatusFilterSet(statusFilters);
  const hasSingleStatus = statusFilters.length === 1 ? statusFilters[0] : undefined;
  const apiStatus =
    hasSingleStatus === "pending" || hasSingleStatus === "paid" ? hasSingleStatus : undefined;

  if (!monthRange.from || !monthRange.to) {
    return {
      timezone,
      filters: {
        scope: filters.scope,
        accountId: filters.accountId,
        statuses: statusFilters,
        month: filters.month,
        from: monthRange.from,
        to: monthRange.to,
      },
      source: {
        backendApplied: [],
        frontendApplied: ["invalid-month"],
      },
      occurrences: [],
    };
  }

  const rawOccurrences = await listOccurrences({
    startDate: monthRange.from,
    endDate: monthRange.to,
    month: filters.month,
    scope: filters.scope,
    ...(apiStatus ? { status: apiStatus } : {}),
  });

  const mappedOccurrences = rawOccurrences
    .map(toFinancialDashboardOccurrenceViewModel)
    .filter((item): item is FinancialDashboardOccurrenceViewModel => Boolean(item));

  const occurrences = mappedOccurrences.filter((item) => {
    if (filters.accountId && item.accountId !== filters.accountId) {
      return false;
    }

    if (monthRange.from && monthRange.to) {
      // Keep frontend filtering as a safety net in case backend ignores date boundaries.
      if (item.dueDateKey < monthRange.from || item.dueDateKey > monthRange.to) {
        return false;
      }
    }

    if (statusSet && !statusSet.has(item.status)) {
      return false;
    }

    return true;
  });

  return {
    timezone,
    filters: {
      scope: filters.scope,
      accountId: filters.accountId,
      statuses: statusFilters,
      month: filters.month,
      from: monthRange.from,
      to: monthRange.to,
    },
    source: {
      backendApplied: [
        "startDate",
        "endDate",
        "month",
        "scope",
        ...(apiStatus ? ["status"] : []),
      ],
      frontendApplied: [
        ...(filters.accountId ? ["accountId"] : []),
        ...(!apiStatus && statusFilters.length > 0 ? ["status(client)"] : []),
        ...(monthRange.from && monthRange.to ? ["month-range-safety-filter"] : []),
      ],
    },
    occurrences,
  };
}
