"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { LoginFormValues, loginFormSchema } from "@/features/auth/schema";
import { t } from "@/lib/i18n";

const inputClassName =
  "ds-focus-ring w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground";

type LoginFormProps = {
  isSubmitting?: boolean;
  onSubmit: (values: LoginFormValues) => Promise<void>;
};

export function LoginForm({ isSubmitting, onSubmit }: LoginFormProps) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  return (
    <form
      className="mt-5 space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-foreground">{t("auth.fields.login")}</span>
        <input
          type="text"
          className={inputClassName}
          placeholder={t("auth.fields.loginPlaceholder")}
          {...form.register("login")}
        />
        {form.formState.errors.login ? (
          <p className="text-xs text-destructive">{form.formState.errors.login.message}</p>
        ) : null}
      </label>

      <label className="grid gap-1.5 text-sm">
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
      </Button>
    </form>
  );
}
