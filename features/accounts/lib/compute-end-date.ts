import type { AccountRecurrenceType } from "@/features/accounts/types";

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Last installment date when the first charge is on `startIso` and there are
 * `installmentCount` charges spaced by `recurrence` (inclusive of the start date).
 */
export function computeEndDateFromInstallments(
  startIso: string,
  recurrence: AccountRecurrenceType,
  installmentCount: number,
): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startIso) || installmentCount < 1) {
    return "";
  }

  const steps = installmentCount - 1;
  const [y, m, d] = startIso.split("-").map(Number);
  const date = new Date(y, m - 1, d);

  switch (recurrence) {
    case "ONCE":
      return startIso;
    case "DAILY":
      date.setDate(date.getDate() + steps);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7 * steps);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + steps);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + steps);
      break;
    default:
      return startIso;
  }

  return toYmd(date);
}
