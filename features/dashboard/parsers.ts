import {
  FinancialDashboardOccurrenceDto,
  FinancialDashboardOccurrenceViewModel,
} from "@/features/dashboard/types";
import { OccurrenceStatus } from "@/features/occurrences/types";

function getLastDayOfMonth(year: number, monthOneBased: number) {
  return new Date(year, monthOneBased, 0).getDate();
}

function formatDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function toDateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map((part) => Number.parseInt(part, 10));
  if (!year || !month || !day) {
    return new Date(Number.NaN);
  }

  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function resolveUserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function getDateKeyInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

export function buildMonthRange(month: string) {
  const [rawYear, rawMonth] = month.split("-");
  const year = Number.parseInt(rawYear ?? "", 10);
  const monthOneBased = Number.parseInt(rawMonth ?? "", 10);

  if (!year || !monthOneBased || monthOneBased < 1 || monthOneBased > 12) {
    return {
      from: "",
      to: "",
    };
  }

  const lastDay = getLastDayOfMonth(year, monthOneBased);
  return {
    from: `${year}-${formatDatePart(monthOneBased)}-01`,
    to: `${year}-${formatDatePart(monthOneBased)}-${formatDatePart(lastDay)}`,
  };
}

export function toStatusFilterSet(statuses?: OccurrenceStatus[]) {
  if (!statuses || statuses.length === 0) {
    return null;
  }

  return new Set(statuses);
}

export function toFinancialDashboardOccurrenceViewModel(
  occurrence: FinancialDashboardOccurrenceDto,
): FinancialDashboardOccurrenceViewModel | null {
  const dueDateKey = occurrence.dueDate?.slice(0, 10) ?? "";
  const dueDate = toDateFromKey(dueDateKey);

  if (!Number.isFinite(dueDate.getTime()) || !occurrence.status) {
    return null;
  }

  let paidAt: Date | undefined;
  if (occurrence.paidAt) {
    const parsed = new Date(occurrence.paidAt);
    if (Number.isFinite(parsed.getTime())) {
      paidAt = parsed;
    }
  }

  return {
    id: occurrence.id,
    titleSnapshot: (occurrence.titleSnapshot ?? occurrence.description).trim() || occurrence.description,
    description: occurrence.description,
    amount: occurrence.amount,
    dueDate,
    dueDateKey,
    paidAt,
    status: occurrence.status,
    accountId: occurrence.accountId,
    categoryId: occurrence.categoryId,
    scope: occurrence.scope,
  };
}
