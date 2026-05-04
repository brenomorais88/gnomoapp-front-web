"use client";

import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDateKeyInTimezone } from "@/features/dashboard/parsers";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type CalendarViewMode = "month" | "week";

type FinancialCalendarProps = {
  currentMonth: Date;
  viewMode: CalendarViewMode;
  selectedDate: Date;
  timezone: string;
  onCurrentMonthChange: (nextMonth: Date) => void;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onSelectedDateChange: (date: Date) => void;
};

const weekDayLabels = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export function FinancialCalendar({
  currentMonth,
  viewMode,
  selectedDate,
  timezone,
  onCurrentMonthChange,
  onViewModeChange,
  onSelectedDateChange,
}: FinancialCalendarProps) {
  const monthStart = startOfMonth(currentMonth);
  const visibleStart =
    viewMode === "month"
      ? startOfWeek(monthStart, { weekStartsOn: 0 })
      : startOfWeek(selectedDate, { weekStartsOn: 0 });
  const visibleEnd =
    viewMode === "month"
      ? endOfWeek(endOfMonth(monthStart), { weekStartsOn: 0 })
      : endOfWeek(selectedDate, { weekStartsOn: 0 });
  const visibleDays = eachDayOfInterval({ start: visibleStart, end: visibleEnd });
  const todayKey = getDateKeyInTimezone(new Date(), timezone);
  const selectedKey = getDateKeyInTimezone(selectedDate, timezone);

  function handleNavigate(direction: "previous" | "next") {
    if (viewMode === "month") {
      const nextMonth = direction === "previous" ? addMonths(currentMonth, -1) : addMonths(currentMonth, 1);
      onCurrentMonthChange(startOfMonth(nextMonth));
      return;
    }

    const nextSelected = direction === "previous" ? addWeeks(selectedDate, -1) : addWeeks(selectedDate, 1);
    onSelectedDateChange(nextSelected);
    onCurrentMonthChange(startOfMonth(nextSelected));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-md border border-border p-1">
          <Button
            size="sm"
            variant={viewMode === "month" ? "secondary" : "ghost"}
            onClick={() => onViewModeChange("month")}
            aria-pressed={viewMode === "month"}
          >
            {t("financeDashboard.calendar.monthView")}
          </Button>
          <Button
            size="sm"
            variant={viewMode === "week" ? "secondary" : "ghost"}
            onClick={() => onViewModeChange("week")}
            aria-pressed={viewMode === "week"}
          >
            {t("financeDashboard.calendar.weekView")}
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => handleNavigate("previous")}
            aria-label={t("financeDashboard.calendar.previousPeriod")}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <p className="min-w-[170px] text-center text-sm font-medium text-foreground">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </p>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => handleNavigate("next")}
            aria-label={t("financeDashboard.calendar.nextPeriod")}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDayLabels.map((label) => (
          <span
            key={label}
            className="px-1 py-1 text-center text-[11px] font-medium uppercase text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {visibleDays.map((day) => {
          const dayKey = getDateKeyInTimezone(day, timezone);
          const isSelected = dayKey === selectedKey;
          const isToday = dayKey === todayKey;
          const isFromCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => {
                onSelectedDateChange(day);
                onCurrentMonthChange(startOfMonth(day));
              }}
              className={cn(
                "ds-focus-ring h-9 rounded-md border text-xs font-medium transition-colors",
                isSelected
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-transparent text-foreground hover:bg-muted",
                !isFromCurrentMonth && viewMode === "month" ? "text-muted-foreground" : "",
              )}
              aria-pressed={isSelected}
            >
              <span>{format(day, "d")}</span>
              {isToday && !isSelected ? (
                <span className="sr-only">{t("financeDashboard.calendar.today")}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
