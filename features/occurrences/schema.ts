import { z } from "zod";
import { t } from "@/lib/i18n";

export const occurrenceFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, t("validation.requiredDescription"))
    .max(160, t("validation.descriptionTooLong")),
  amount: z
    .number()
    .refine((value) => Number.isFinite(value), t("validation.requiredAmount"))
    .min(0, t("validation.negativeAmount")),
  dueDate: z.string().min(1, t("validation.requiredDueDate")),
  accountId: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  status: z.enum(["pending", "paid", "overdue", "cancelled"]),
});

export type OccurrenceFormValues = z.infer<typeof occurrenceFormSchema>;

export const occurrenceOverrideSchema = z.object({
  amount: z.coerce
    .number()
    .refine((value) => Number.isFinite(value), t("validation.requiredAmount"))
    .min(0, t("validation.negativeAmount")),
});

export type OccurrenceOverrideFormValues = z.infer<typeof occurrenceOverrideSchema>;
