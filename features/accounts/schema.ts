import { z } from "zod";
import { AccountRecurrenceType } from "@/features/accounts/types";
import { t } from "@/lib/i18n";

export const recurrenceTypeOptions: {
  value: AccountRecurrenceType;
  label: string;
}[] = [
  { value: "ONCE", label: t("accounts.recurrence.ONCE") },
  { value: "DAILY", label: t("accounts.recurrence.DAILY") },
  { value: "WEEKLY", label: t("accounts.recurrence.WEEKLY") },
  { value: "MONTHLY", label: t("accounts.recurrence.MONTHLY") },
  { value: "YEARLY", label: t("accounts.recurrence.YEARLY") },
];

export const accountFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, t("validation.requiredTitle"))
      .max(120, t("validation.titleTooLong")),
    baseAmount: z
      .number()
      .refine((value) => Number.isFinite(value), t("validation.requiredAmount"))
      .min(0, t("validation.negativeAmount")),
    startDate: z.string().min(1, t("validation.requiredStartDate")),
    endDate: z.string().optional().or(z.literal("")),
    recurrenceType: z.enum(["ONCE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
    categoryId: z.string().trim().min(1, t("validation.requiredCategory")),
    notes: z
      .string()
      .trim()
      .max(500, t("validation.notesTooLong"))
      .optional()
      .or(z.literal("")),
    active: z.boolean(),
  })
  .refine(
    (values) => {
      if (!values.endDate) {
        return true;
      }

      return values.endDate >= values.startDate;
    },
    {
      path: ["endDate"],
      message: t("validation.invalidEndDate"),
    },
  );

export type AccountFormValues = z.infer<typeof accountFormSchema>;
