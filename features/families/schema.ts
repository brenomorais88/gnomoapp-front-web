import { z } from "zod";
import { t } from "@/lib/i18n";

export const createFamilySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, t("onboarding.family.validation.requiredName"))
    .max(80, t("onboarding.family.validation.maxName")),
});

export type CreateFamilyFormValues = z.infer<typeof createFamilySchema>;

export const createPendingMemberSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, t("family.memberForm.validation.requiredDisplayName"))
    .max(120, t("family.memberForm.validation.maxDisplayName")),
  document: z.string().trim().optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .email(t("family.memberForm.validation.invalidEmail"))
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
});

export type CreatePendingMemberFormValues = z.infer<typeof createPendingMemberSchema>;
