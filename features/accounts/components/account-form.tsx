"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useCategoriesListQuery } from "@/features/categories/hooks";
import { accountFormSchema, AccountFormValues, recurrenceTypeOptions } from "@/features/accounts/schema";
import { LoadingState } from "@/components/shared/feedback/loading-state";
import { ErrorState } from "@/components/shared/feedback/error-state";
import { getErrorMessage } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

type AccountFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<AccountFormValues>;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: AccountFormValues) => Promise<void>;
};

const inputClassName =
  "ds-focus-ring w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground";

export function AccountForm({
  mode,
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
}: AccountFormProps) {
  const categoriesQuery = useCategoriesListQuery({ active: true });

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      baseAmount: initialValues?.baseAmount ?? 0,
      startDate: initialValues?.startDate ?? "",
      endDate: initialValues?.endDate ?? "",
      recurrenceType: initialValues?.recurrenceType ?? "MONTHLY",
      categoryId: initialValues?.categoryId ?? "",
      notes: initialValues?.notes ?? "",
      active: initialValues?.active ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      title: initialValues?.title ?? "",
      baseAmount: initialValues?.baseAmount ?? 0,
      startDate: initialValues?.startDate ?? "",
      endDate: initialValues?.endDate ?? "",
      recurrenceType: initialValues?.recurrenceType ?? "MONTHLY",
      categoryId: initialValues?.categoryId ?? "",
      notes: initialValues?.notes ?? "",
      active: initialValues?.active ?? true,
    });
  }, [form, initialValues]);

  if (categoriesQuery.isLoading) {
    return <LoadingState label={t("accounts.form.loadingOptions")} className="min-h-24" />;
  }

  if (categoriesQuery.isError) {
    return (
      <ErrorState
        title={t("accounts.loadCategoriesErrorTitle")}
        description={getErrorMessage(categoriesQuery.error)}
        action={
          <Button variant="outline" onClick={() => categoriesQuery.refetch()}>
            {t("actions.tryAgain")}
          </Button>
        }
      />
    );
  }

  const categoryOptions = categoriesQuery.data ?? [];

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <label htmlFor="account-title" className="text-sm font-medium text-foreground">
            {t("accounts.form.title")}
          </label>
          <input id="account-title" className={inputClassName} {...form.register("title")} />
          {form.formState.errors.title ? (
            <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label htmlFor="account-baseAmount" className="text-sm font-medium text-foreground">
            {t("accounts.form.baseAmount")}
          </label>
          <input
            id="account-baseAmount"
            type="number"
            step="0.01"
            className={inputClassName}
            {...form.register("baseAmount", { valueAsNumber: true })}
          />
          {form.formState.errors.baseAmount ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.baseAmount.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label htmlFor="account-recurrenceType" className="text-sm font-medium text-foreground">
            {t("accounts.form.recurrenceType")}
          </label>
          <select
            id="account-recurrenceType"
            className={cn(inputClassName, "h-10")}
            {...form.register("recurrenceType")}
          >
            {recurrenceTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="account-startDate" className="text-sm font-medium text-foreground">
            {t("accounts.form.startDate")}
          </label>
          <input
            id="account-startDate"
            type="date"
            className={cn(inputClassName, "h-10")}
            {...form.register("startDate")}
          />
          {form.formState.errors.startDate ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.startDate.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label htmlFor="account-endDate" className="text-sm font-medium text-foreground">
            {t("accounts.form.endDate")}
          </label>
          <input
            id="account-endDate"
            type="date"
            className={cn(inputClassName, "h-10")}
            {...form.register("endDate")}
          />
          {form.formState.errors.endDate ? (
            <p className="text-xs text-destructive">{form.formState.errors.endDate.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <label htmlFor="account-categoryId" className="text-sm font-medium text-foreground">
            {t("accounts.form.category")}
          </label>
          <select
            id="account-categoryId"
            className={cn(inputClassName, "h-10")}
            {...form.register("categoryId")}
          >
            <option value="">{t("accounts.form.selectCategory")}</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {form.formState.errors.categoryId ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.categoryId.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <label htmlFor="account-notes" className="text-sm font-medium text-foreground">
            {t("accounts.form.notes")}
          </label>
          <textarea
            id="account-notes"
            className={cn(inputClassName, "min-h-24 resize-y")}
            {...form.register("notes")}
          />
          {form.formState.errors.notes ? (
            <p className="text-xs text-destructive">{form.formState.errors.notes.message}</p>
          ) : null}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" className="size-4 rounded border-input" {...form.register("active")} />
        {t("accounts.form.active")}
      </label>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {mode === "create" ? t("actions.createAccount") : t("actions.saveChanges")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {t("actions.cancel")}
        </Button>
      </div>
    </form>
  );
}
