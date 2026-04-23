"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  createPendingMemberSchema,
  CreatePendingMemberFormValues,
} from "@/features/families/schema";
import { t } from "@/lib/i18n";

const inputClassName =
  "ds-focus-ring w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground";

type CreatePendingMemberFormProps = {
  isSubmitting?: boolean;
  onSubmit: (values: CreatePendingMemberFormValues) => Promise<void>;
  onCancel: () => void;
};

export function CreatePendingMemberForm({
  isSubmitting,
  onSubmit,
  onCancel,
}: CreatePendingMemberFormProps) {
  const form = useForm<CreatePendingMemberFormValues>({
    resolver: zodResolver(createPendingMemberSchema),
    defaultValues: {
      displayName: "",
      document: "",
      email: "",
      phone: "",
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium text-foreground">
            {t("family.memberForm.fields.displayName")}
          </span>
          <input className={inputClassName} {...form.register("displayName")} />
          {form.formState.errors.displayName ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.displayName.message}
            </p>
          ) : null}
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground">
            {t("family.memberForm.fields.documentOptional")}
          </span>
          <input className={inputClassName} {...form.register("document")} />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground">
            {t("family.memberForm.fields.emailOptional")}
          </span>
          <input type="email" className={inputClassName} {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </label>

        <label className="grid gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium text-foreground">
            {t("family.memberForm.fields.phoneOptional")}
          </span>
          <input className={inputClassName} {...form.register("phone")} />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t("family.memberForm.submitting")
            : t("family.memberForm.submit")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {t("actions.cancel")}
        </Button>
      </div>
    </form>
  );
}
