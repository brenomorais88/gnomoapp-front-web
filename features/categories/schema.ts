import { z } from "zod";
import { t } from "@/lib/i18n";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, t("validation.requiredName"))
    .max(80, t("validation.nameTooLong")),
  description: z
    .string()
    .trim()
    .max(200, t("validation.descriptionTooLong"))
    .optional()
    .or(z.literal("")),
  color: z
    .string()
    .trim()
    .regex(/^#([0-9A-Fa-f]{6})$/, t("validation.invalidHexColor"))
    .optional()
    .or(z.literal("")),
  active: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
