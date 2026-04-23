"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  createFamilySchema,
  CreateFamilyFormValues,
} from "@/features/families/schema";
import { t } from "@/lib/i18n";

const inputClassName =
  "ds-focus-ring w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground";

type CreateFamilyFormProps = {
  isSubmitting?: boolean;
  onSubmit: (values: CreateFamilyFormValues) => Promise<void>;
};

export function CreateFamilyForm({
  isSubmitting,
  onSubmit,
}: CreateFamilyFormProps) {
  const form = useForm<CreateFamilyFormValues>({
    resolver: zodResolver(createFamilySchema),
    defaultValues: {
      name: "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-foreground">
          {t("onboarding.family.form.name")}
        </span>
        <input
          className={inputClassName}
          placeholder={t("onboarding.family.form.namePlaceholder")}
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </label>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("onboarding.family.form.submitting")
          : t("onboarding.family.form.submit")}
      </Button>
    </form>
  );
}
