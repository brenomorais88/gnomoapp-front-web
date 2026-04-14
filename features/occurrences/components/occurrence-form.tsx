"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/feedback/error-state";
import { LoadingState } from "@/components/shared/feedback/loading-state";
import { useAccountsListQuery } from "@/features/accounts/hooks";
import { useCategoriesListQuery } from "@/features/categories/hooks";
import { OccurrenceFormValues, occurrenceFormSchema } from "@/features/occurrences/schema";
import { getErrorMessage } from "@/lib/api/error";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type OccurrenceFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<OccurrenceFormValues>;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: OccurrenceFormValues) => Promise<void>;
};

const inputClassName =
  "ds-focus-ring w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground";

export function OccurrenceForm({
  mode,
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
}: OccurrenceFormProps) {
  const accountsQuery = useAccountsListQuery({ active: true, size: 300 });
  const categoriesQuery = useCategoriesListQuery({ active: true, size: 300 });

  const form = useForm<OccurrenceFormValues>({
    resolver: zodResolver(occurrenceFormSchema),
    defaultValues: {
      description: initialValues?.description ?? "",
      amount: initialValues?.amount ?? 0,
      dueDate: initialValues?.dueDate ?? "",
      accountId: initialValues?.accountId ?? "",
      categoryId: initialValues?.categoryId ?? "",
      status: initialValues?.status ?? "pending",
    },
  });

  useEffect(() => {
    form.reset({
      description: initialValues?.description ?? "",
      amount: initialValues?.amount ?? 0,
      dueDate: initialValues?.dueDate ?? "",
      accountId: initialValues?.accountId ?? "",
      categoryId: initialValues?.categoryId ?? "",
      status: initialValues?.status ?? "pending",
    });
  }, [form, initialValues]);

  if (accountsQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingState label={t("occurrences.form.loadingOptions")} className="min-h-24" />;
  }

  if (accountsQuery.isError) {
    return (
      <ErrorState
        title={t("occurrences.loadAccountsErrorTitle")}
        description={getErrorMessage(accountsQuery.error)}
        action={
          <Button variant="outline" onClick={() => accountsQuery.refetch()}>
            {t("actions.tryAgain")}
          </Button>
        }
      />
    );
  }

  if (categoriesQuery.isError) {
    return (
      <ErrorState
        title={t("occurrences.loadCategoriesErrorTitle")}
        description={getErrorMessage(categoriesQuery.error)}
        action={
          <Button variant="outline" onClick={() => categoriesQuery.refetch()}>
            {t("actions.tryAgain")}
          </Button>
        }
      />
    );
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <label htmlFor="occurrence-description" className="text-sm font-medium text-foreground">
            {t("occurrences.form.description")}
          </label>
          <input id="occurrence-description" className={inputClassName} {...form.register("description")} />
          {form.formState.errors.description ? (
            <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label htmlFor="occurrence-amount" className="text-sm font-medium text-foreground">
            {t("occurrences.form.amount")}
          </label>
          <input
            id="occurrence-amount"
            type="number"
            step="0.01"
            className={inputClassName}
            {...form.register("amount", { valueAsNumber: true })}
          />
          {form.formState.errors.amount ? (
            <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label htmlFor="occurrence-dueDate" className="text-sm font-medium text-foreground">
            {t("occurrences.form.dueDate")}
          </label>
          <input
            id="occurrence-dueDate"
            type="date"
            className={cn(inputClassName, "h-10")}
            {...form.register("dueDate")}
          />
          {form.formState.errors.dueDate ? (
            <p className="text-xs text-destructive">{form.formState.errors.dueDate.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label htmlFor="occurrence-accountId" className="text-sm font-medium text-foreground">
            {t("occurrences.form.account")}
          </label>
          <select id="occurrence-accountId" className={cn(inputClassName, "h-10")} {...form.register("accountId")}>
            <option value="">{t("occurrences.form.selectAccount")}</option>
            {(accountsQuery.data ?? []).map((account) => (
              <option key={account.id} value={account.id}>
                {account.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="occurrence-categoryId" className="text-sm font-medium text-foreground">
            {t("occurrences.form.category")}
          </label>
          <select id="occurrence-categoryId" className={cn(inputClassName, "h-10")} {...form.register("categoryId")}>
            <option value="">{t("occurrences.form.selectCategory")}</option>
            {(categoriesQuery.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <label htmlFor="occurrence-status" className="text-sm font-medium text-foreground">
            {t("occurrences.form.status")}
          </label>
          <select id="occurrence-status" className={cn(inputClassName, "h-10")} {...form.register("status")}>
            <option value="pending">{t("occurrences.statusFilter.pending")}</option>
            <option value="paid">{t("occurrences.statusFilter.paid")}</option>
            <option value="overdue">{t("occurrences.statusFilter.overdue")}</option>
            <option value="cancelled">{t("occurrences.statusFilter.cancelled")}</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {mode === "create" ? t("actions.createOccurrence") : t("actions.saveChanges")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {t("actions.cancel")}
        </Button>
      </div>
    </form>
  );
}
