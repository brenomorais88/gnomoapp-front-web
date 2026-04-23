import { z } from "zod";
import { t } from "@/lib/i18n";

export const loginFormSchema = z.object({
  login: z.string().trim().min(1, t("auth.validation.requiredLogin")),
  password: z
    .string()
    .trim()
    .min(6, t("auth.validation.passwordMinLength")),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z.object({
  firstName: z.string().trim().min(1, t("auth.validation.requiredFirstName")),
  lastName: z.string().trim().min(1, t("auth.validation.requiredLastName")),
  document: z.string().trim().min(1, t("auth.validation.requiredDocument")),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, t("auth.validation.invalidBirthDate")),
  password: z
    .string()
    .trim()
    .min(6, t("auth.validation.passwordMinLength")),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email(t("auth.validation.invalidEmail")).optional().or(z.literal("")),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
