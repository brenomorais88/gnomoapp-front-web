"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { RegisterFormValues, registerFormSchema } from "@/features/auth/schema";
import { t } from "@/lib/i18n";

const inputClassName =
  "ds-focus-ring w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground";

type RegisterFormProps = {
  isSubmitting?: boolean;
  onSubmit: (values: RegisterFormValues) => Promise<void>;
};

export function RegisterForm({ isSubmitting, onSubmit }: RegisterFormProps) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      document: "",
      birthDate: "",
      password: "",
      phone: "",
      email: "",
    },
  });

  return (
    <form
      className="mt-5 grid gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground">{t("auth.fields.firstName")}</span>
          <input className={inputClassName} {...form.register("firstName")} />
          {form.formState.errors.firstName ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.firstName.message}
            </p>
          ) : null}
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground">{t("auth.fields.lastName")}</span>
          <input className={inputClassName} {...form.register("lastName")} />
          {form.formState.errors.lastName ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.lastName.message}
            </p>
          ) : null}
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground">{t("auth.fields.document")}</span>
          <input className={inputClassName} {...form.register("document")} />
          {form.formState.errors.document ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.document.message}
            </p>
          ) : null}
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground">{t("auth.fields.birthDate")}</span>
          <input type="date" className={inputClassName} {...form.register("birthDate")} />
          {form.formState.errors.birthDate ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.birthDate.message}
            </p>
          ) : null}
        </label>

        <label className="grid gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium text-foreground">{t("auth.fields.password")}</span>
          <input
            type="password"
            className={inputClassName}
            placeholder="••••••••"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground">{t("auth.fields.phoneOptional")}</span>
          <input className={inputClassName} {...form.register("phone")} />
          {form.formState.errors.phone ? (
            <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
          ) : null}
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground">{t("auth.fields.emailOptional")}</span>
          <input type="email" className={inputClassName} {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          ) : null}
        </label>
      </div>

      <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? t("auth.register.submitting") : t("auth.register.submit")}
      </Button>
    </form>
  );
}
